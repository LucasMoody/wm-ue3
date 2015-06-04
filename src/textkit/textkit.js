var snowball = require('node-snowball');
var stop_words=require('multi-stopwords')(['de']);
var should = require('should');
var mongo = require('../dbconnection/mongo-con.js'),
    fs = require('fs'),
    path = require('path'),
    TRAINING_DATA_FILE_NAME = "train.ds",
    TEST_DATA_FILE_NAME = "test.ds";

function retrieveFromDb(){

}

exports.prepareDocuments = function(callback){
    
    mongo.getTrainingDocuments(function(err, res) {
        // res: [{text:"<html>...", label:TRUE}, {text:...}]
        if (!err) {
            // [{text:"the peter pan", label:TRUE}, {text:...}]
            var documents = getRecipeBodyText(res);
            // [{text:"the peter pan", label:TRUE}, {text:...}]
            var documents = getRecipeDivText(res); //alternativ
            // [{words:["the", peter", "pan"], label:TRUE}, {words:...}]
            var docWordLists = documentToWordList(documents);
            // [{words:"peter", "pan"], label:TRUE}, {words:...}]
            docWordLists = stemAndStop(docWordLists);
            
            var randomSelection = selectTestTrainRandom(docWordLists);
            // [{words:"peter", "pan"], label:TRUE}, {words:...}]
            var trainDocWordLists = randomSelection.train;
            // [{words:"peter", "pan"], label:TRUE}, {words:...}]
            var testDocWordLists = randomSelection.test;
            
            var tfidfResult = calcTfIdf(trainDocWordLists, testDocWordLists);
            // [{vec:{"peter":0.4, "pan":0.7}, label:TRUE}, {vec:...}]
            var trainFeatureVectors = tfidfResult.train;
            // [{vec:{"peter":0.4, "pan":0.7}, label:TRUE}, {vec:...}]
            var testFeatureVectors = tfidfResult.test;
            
            var dfObject = tfidfResult.df;
            
            var featureSelectionResult = selectFeatures(trainFeatureVectors, testFeatureVectors, dfObject, 50);
            // [{vec:{"pan":0.7, "peter":0.4}, label:TRUE}, {vec:...}]
            trainFeatureVectors = featureSelectionResult.train;
            // [{vec:{"pan":0.7, "peter":0.4}, label:TRUE}, {vec:...}]
            testFeatureVectors = featureSelectionResult.test;
            
            // Die Featurevektoren sind nun nach tfidf Relevanz absteigend sortiert, d.h.
            // alle Vektoren enthalten die gleichen Attribute in der gleichen Reihenfolge
            
            saveSparse(trainFeatureVectors,testFeatureVectors);
        }
    });
}

function getRecipeDivText(htmlDocuments) {
    
}

function getRecipeBodyText(htmlDocuments) {
    
}

function documentToWordList(){
    
}

//Wenden Sie auf die Liste von Wörtern Stoppwort-Filterung und Stemming an. 
//Beachten Sie zu Stemming die Hinweise am Ende. 
function stemAndStop(documents){
    var result = Array();
    // Iterate all documents
    for(var i=0; i<documents.length; i++){
        var curWords = documents[i].words;
        var resWords = Array();
        // Iterate all words in a document
        for(var j=0; j<curWords.length; j++){
            if(stop_words.indexOf(curWords[j]) == -1){
                //Wort ist kein Stopwort, speichere Wordstamm
                resWords.push(snowball.stemword(curWords[j], 'german'));
            } else {
                //Wort ist ein Stopwort -> wird ignoriert
            }
        }
        result.push({'words':resWords, 'label':documents[i].label});
    }
    return result;
}

function selectTestTrainRandom(docWordLists){
    
}

function calcTfIdf(trainDocs, testDocs){
    
    ///////////////////////////////////////////////
    // Calculate training data and save idf-Object
    ///////////////////////////////////////////////
    var tfTrainArray = Array();
    var idfObject = {};
    // Iterate through all documents
    for(var i=0; i<trainDocs.length; i++){
        var tf = {};
        var wordlist = trainDocs[i].words;
        // Iterate through all words in one document
        for(var j=0; j<wordlist.length; j++){
            // Update absolute term frequency
            if(tf.hasOwnProperty(wordlist[j])){
                tf[wordlist[j]] = tf[wordlist[j]] + 1;
            } else{
                tf[wordlist[j]] = 1;
            }
        }
        tfTrainArray.push(tf);
        // Iterate through all terms in one document
        for(var k=0, keys=Object.keys(tf); k<keys.length; k++){
            // Update document frequencies
            if(idfObject.hasOwnProperty(keys[k])){
                idfObject[keys[k]] = idfObject[keys[k]] + 1;
            } else{
                idfObject[keys[k]] = 1;
            }
            // Save realtive frequency for each term
            tf[keys[k]] = tf[keys[k]] / wordlist.length;
        }
    }
    // Save df Object before making it idf
    // http://stackoverflow.com/questions/6089058/nodejs-how-to-clone-a-object
    var dfObjRes = JSON.parse(JSON.stringify(idfObject));
    // Iterate through all df terms and make them idf
    for(var l=0, keys=Object.keys(idfObject); l<keys.length; l++){
        // Save logarithmic inverted document frequency
        idfObject[keys[l]] = log(10, (trainDocs.length / idfObject[keys[l]]));
    }
    // Calculate and save the tfidf value for every term
    var tfIdfTrainArray = Array();
    for(var m=0; m<tfTrainArray.length; m++){
        var tfidf = {};
        for(var n=0, keys=Object.keys(tfTrainArray[m]); n<keys.length; n++){
            tfidf[keys[n]] = tfTrainArray[m][keys[n]] * idfObject[keys[n]];
        }
        tfIdfTrainArray.push(tfidf);
    }
    
    /////////////////////////
    // Calculate test data
    /////////////////////////
    
    var tfTestArray = Array();
    
    for(var i=0; i<testDocs.length; i++){
        var tf = {};
        wordlist = testDocs[i].words;
        // Iterate through all words in one document
        for(var j=0; j<wordlist.length; j++){
            // Update absolute term frequency
            if(tf.hasOwnProperty(wordlist[j])){
                tf[wordlist[j]] = tf[wordlist[j]] + 1;
            } else{
                tf[wordlist[j]] = 1;
            }
        }
        tfTestArray.push(tf);
    }
    
    var tfIdfTestArray = Array();
    
    for(var m=0; m<tfTestArray.length; m++){
        var tfidf = {};
        for(var n=0, keys=Object.keys(tfTestArray[m]); n<keys.length; n++){
            tfidf[keys[n]] = tfTestArray[m][keys[n]] * idfObject[keys[n]];
        }
        tfIdfTestArray.push(tfidf);
    }
    
    /////////////////////////////////
    // Concatenate the result object
    ////////////////////////////////
    
    var trainRes = Array();
    var testRes = Array();
    
    for(var p=0; p<trainDocs.length; p++){
        trainRes.push({'vec':tfIdfTrainArray[p], 'label':trainDocs[p].label});
    }
    for(var q=0; q<testDocs.length; q++){
        testRes.push({'vec':tfIdfTestArray[q], 'label':testDocs[q].label});
    }
    
    return {'train':trainRes, 'test':testRes, 'df':dfObjRes};
}

function log(base, number) {  
    return Math.log(number) / Math.log(base);  
}

// Ihr Programm sollte in der Lage sein, die relevantesten N Wörter (Features) zu selektieren. 
// Sortieren sie dabei einfach die Wörter nach ihrer Dokumenthäufigkeit im Trainingsset 
// und behalten sie die N häufigsten. 
function selectFeatures(trainFeatureVectors, testFeatureVectors, df, n){
    // Sort words in trainingSet according to document frequency
    var keysSorted = Object.keys(df).sort(function(a,b){return df[b]-df[a]});
    var trainRes = Array();
    var testRes = Array();
    // Save the training feature vectors with these keys
    for(var i=0; i<trainFeatureVectors.length; i++){
        var trainInstance = {};
        for(var j=0; j<n && j<keysSorted.length; j++){
            if(trainFeatureVectors[i].vec.hasOwnProperty(keysSorted[j])){
                trainInstance[keysSorted[j]] = trainFeatureVectors[i].vec[keysSorted[j]];
            } else {
                trainInstance[keysSorted[j]] = 0;
            }
        }
        trainRes.push({'vec':trainInstance, 'label':trainFeatureVectors[i].label});
    }
    // Save the test feature vectors with these keys
    for(var i=0; i<testFeatureVectors.length; i++){
        var testInstance = {};
        for(var j=0; j<n && j<keysSorted.length; j++){
            if(testFeatureVectors[i].vec.hasOwnProperty(keysSorted[j])){
                testInstance[keysSorted[j]] = trainFeatureVectors[i].vec[keysSorted[j]];
            } else {
                testInstance[keysSorted[j]] = 0;
            }
        }
        testRes.push({'vec':testInstance, 'label':testFeatureVectors[i].label});
    }
    // Concatenate result
    return {train:trainRes, test:testRes};
}

function saveSparse(trainFeatureVectors, testFeatureVectors){
        //maps index to a word e.g. money is word with index 10
    var wordIndexMap = {},
        //start index counter with 0
        curNumOfIndices = 0;
        
    //determine word indices for each word in trainingset
    trainFeatureVectors.forEach(function(val, idx) {
        for (var word in val.vec) {
            if (val.vec.hasOwnProperty(word) && !(word in wordIndexMap)) {
                wordIndexMap[curNumOfIndices] = word;
                curNumOfIndices++;
            }
        }    
    });
    //determine word indices for each word in testset
    testFeatureVectors.forEach(function(val, idx) {
        for (var word in val.vec) {
            if (val.vec.hasOwnProperty(word) && !(word in wordIndexMap)) {
                wordIndexMap[word] = curNumOfIndices;
                curNumOfIndices++;
            }
        }    
    });
    
    saveDs(wordIndexMap, trainFeatureVectors, testFeatureVectors);
}

function saveDs(wordIndexMap, trainFeatureVectors, testFeatureVectors) {
    var trainingWriteStream = fs.createWriteStream(path.join(__dirname, '../classifier/data/') + TRAINING_DATA_FILE_NAME, 'utf8'),
        testWriteStream = fs.createWriteStream(path.join(__dirname, '../classifier/data/') + TRAINING_DATA_FILE_NAME, 'utf8');
    //write training set data to file
    trainFeatureVectors.forEach(function(val, idx) {
        if(val.label) {
            trainingWriteStream.write(1);
            
        } else {
            trainingWriteStream.write(0);
        }
        trainingWriteStream.write(" ");
        for (var index = 0; index<Object.keys(wordIndexMap).length; index++) {
            if (wordIndexMap[index] in val.vec) {
                trainingWriteStream.write(index + ":" + val.vec[wordIndexMap[index]] + " ");
            }
        }
        trainingWriteStream.write("\n");
    });
    
    //write test set data to file
    testFeatureVectors.forEach(function(val, idx) {
        if(val.label) {
            testWriteStream.write(1);
            
        } else {
            testWriteStream.write(0);
        }
        testWriteStream.write(" ");
        for (var index = 0; index<Object.keys(wordIndexMap).length; index++) {
            if (wordIndexMap[index] in val.vec) {
                testWriteStream.write(index + ":" + val.vec[wordIndexMap[index]] + " ");
            }
        }
        testWriteStream.write("\n");
    });
    trainingWriteStream.end();
    testWriteStream.end();
}

function saveArff(wordIndexMap, trainFeatureVectors, testFeatureVectors) {
    var trainingWriteStream = fs.createWriteStream(path.join(__dirname, '../classifier/data/') + TRAINING_DATA_FILE_NAME, 'utf8'),
        testWriteStream = fs.createWriteStream(path.join(__dirname, '../classifier/data/') + TRAINING_DATA_FILE_NAME, 'utf8');
    //write training set data to file
    trainFeatureVectors.forEach(function(val, idx) {
        if(val.label) {
            trainingWriteStream.write(1);
            
        } else {
            trainingWriteStream.write(0);
        }
        trainingWriteStream.write(" ");
        for (var index = 0; index<Object.keys(wordIndexMap).length; index++) {
            if (wordIndexMap[index] in val.vec) {
                trainingWriteStream.write(index + ":" + val.vec[wordIndexMap[index]] + " ");
            }
        }
        trainingWriteStream.write("\n");
    });
    
    //write test set data to file
    testFeatureVectors.forEach(function(val, idx) {
        if(val.label) {
            testWriteStream.write(1);
            
        } else {
            testWriteStream.write(0);
        }
        testWriteStream.write(" ");
        for (var index = 0; index<Object.keys(wordIndexMap).length; index++) {
            if (wordIndexMap[index] in val.vec) {
                testWriteStream.write(index + ":" + val.vec[wordIndexMap[index]] + " ");
            }
        }
        testWriteStream.write("\n");
    });
    trainingWriteStream.end();
    testWriteStream.end();
}


// Mocha tests for Textkit
// describe('Testing Textkit', function(){
//     it('Stopwords and Stemming', function(){
//         var test = [{words:["Peter", "Fragen", "mit", "seinen", "Freunden", "Peter", "Pan", "und", "Hans", "Kochbücher", "Informationen","die", "roten", "Straßen"], label:true}];
//         var result = [{words:["Peter", "Fragen", "Freund", "Peter", "Pan", "Hans", "Kochbuc", "Informat", "roten", "Strass"], label:true}];
//         should.deepEqual(stemAndStop(test), result);
//     });
//     it('TfIdf', function(){
//         var train = [{words:["peter", "pan", "geht", "peter", "peter", "pan"], label:true}, {words:["paul", "peter", "paul", "paul"], label:true}];
//         var test = [{words:["peter"], label:true}, {words:["paul"], label:false}];
//         var logZwei = log(10, 2);
//         var result = {train:[{vec:{"peter":0, "pan":2*logZwei, "geht":logZwei}, label:true}, {vec:{"peter":0, "paul":3*logZwei}, label:true}], test:[{vec:{"peter":0}, label:true},{vec:{"paul":logZwei}, label:false}], df:{"peter":2,"pan":1, "geht":1, "paul":1}};
//         should.deepEqual(calcTfIdf(train, test), result);
//     });
// });

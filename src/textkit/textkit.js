var mongo = require('../dbconnection/mongo-con.js'),
    fs = require('fs'),
    path = require('path'),
    TRAINING_DATA_FILE_NAME = "train.ds",
    TEST_DATA_FILE_NAME = "test.ds";

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

function stemAndStop(documents){
    
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
        var wordlist = trainDocs.words;
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
            if(idfObject.hasOwnProperty(tf[keys[k]])){
                idfObject[tf[keys[k]]] = idfObject[tf[keys[k]]] + 1;
            } else{
                idfObject[tf[keys[k]]] = 1;
            }
            // Save realtive frequency for each term
            tf[keys[k]] = tf[keys[k]] / wordlist.length;
        }
    }
    // Save df Object before making it idf
    var dfObjRes = idfObject;
    // Iterate through all df terms and make them idf
    for(var l=0, keys=Object.keys(idfObject); l<keys.length; l++){
        // Save logarithmic inverted document frequency
        idfObject[keys[k]] = Math.log( (trainDocs.length / idfObject[keys[k]]) );
    }
    
    // Calculate and save the tfidf value for every term
    var tfIdfTrainArray = Array();
    for(var m=0; m<tfTrainArray.length; m++){
        var tfidf = {};
        for(var n=0, keys=Object.keys(tfTrainArray[m]); n<keys.length; n++){
            tfidf[tfTrainArray[m][keys[n]]] = tfTrainArray[m][keys[n]] * idfObject[keys[n]];
        }
        tfIdfTrainArray.push(tfidf);
    }
    
    /////////////////////////
    // Calculate test data
    /////////////////////////
    
    var tfTestArray = Array();
    
    for(var i=0; i<testDocs.length; i++){
        var tf = {};
        wordlist = testDocs.words;
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
            tfidf[tfTestArray[m][keys[n]]] = tfTestArray[m][keys[n]] * idfObject[keys[n]];
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
    for(var q=0; p<testDocs.length; p++){
        testRes.push({'vec':tfIdfTestArray[p], 'label':testDocs[p].label});
    }
    
    return {'train':trainRes, 'test':testRes, 'df':dfObjRes};
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
        for(var j=0; j<n; j++){
            if(trainFeatureVectors[i].vec.hasOwnProperty(keysSorted[j])){
                trainInstance[keysSorted[j]] = trainFeatureVectors[i].vec[keysSorted[j]];
            } else {
                trainInstance[keysSorted[j]] = 0;
            }
        }
        console.log(trainInstance);
        trainRes.push({'vec':trainInstance, 'label':trainFeatureVectors[i].label});
    }
    // Save the test feature vectors with these keys
    for(var i=0; i<testFeatureVectors.length; i++){
        var testInstance = {};
        for(var j=0; j<n; j++){
            if(testFeatureVectors[i].hasOwnProperty(keysSorted[j])){
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
    var trainingWriteStream = fs.createWriteStream(path.join(__dirname, '../classifier/data/') + TRAINING_DATA_FILE_NAME, 'utf8'),
        testWriteStream = fs.createWriteStream(path.join(__dirname, '../classifier/data/') + TRAINING_DATA_FILE_NAME, 'utf8'),
        //maps index to a word e.g. money is word with index 10
        wordIndexMap = {},
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
}

// Short test for select features
// var train = [{vec:{"peter":0.4, "pan":0.7}, label:true}];
// var test = [{vec:{"peter":0.4, "pan":0.7}, label:true}];
// var df = {"peter":0.8, "pan":0.6};

// var res =selectFeatures(train, test, df, 1);
// console.log(res.train[0].vec);

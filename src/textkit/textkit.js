exports.prepareDocuments = function(){
    
    // [{text:"<html>...", label:TRUE}, {text:...}]
    var htmlDocuments = retrieveFromDb();
    // [{text:"the peter pan", label:TRUE}, {text:...}]
    var documents = getRecipeBodyText(htmlDocuments);
    // [{text:"the peter pan", label:TRUE}, {text:...}]
    var documents = getRecipeDivText(htmlDocuments); //alternativ
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
    
    var featureSelectionResult = selectFeatures(trainFeatureVectors, testFeatureVectors);
    // [{vec:{"pan":0.7, "peter":0.4}, label:TRUE}, {vec:...}]
    trainFeatureVectors = featureSelectionResult.train;
    // [{vec:{"pan":0.7, "peter":0.4}, label:TRUE}, {vec:...}]
    testFeatureVectors = featureSelectionResult.test;
    
    // Die Featurevektoren sind nun nach tfidf Relevanz absteigend sortiert, d.h.
    // alle Vektoren enthalten die gleichen Attribute in der gleichen Reihenfolge
    
    var trainFeatureSparse = saveSparse(trainFeatureVectors);
    var testFeatureSparse = saveSparse(testFeatureVectors);
    
    return {train:trainFeatureSparse, test:testFeatureSparse};
}

function retrieveFromDb(){

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
        trainRes.push({vec:tfIdfTrainArray[p], label:trainDocs[p].label});
    }
    for(var q=0; p<testDocs.length; p++){
        testRes.push({vec:tfIdfTestArray[p], label:testDocs[p].label});
    }
    
    return {train:trainRes, test:testRes};
}



function selectFeatures(trainFeatureVectors, testFeatureVectors){
    
}

function saveSparse(featureVector){
    
}
var so = require('stringify-object');
var svm = require('node-svm');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var TRAINING_FILENAME_PREFIX = 'recipes-train-';
var TEST_FILENAME_PREFIX = 'recipes-test-';
var FILE_EXTENSION = '.ds';

// var clf = new svm.CSVC({
//     c: 50,
//     kernelType:'LINEAR'
// });


exports.startSVMClassifier = function(n, costs, probability, resultFileName) {
    var trainFileName = path.join(__dirname, 'data/') + TRAINING_FILENAME_PREFIX + n + FILE_EXTENSION,
        testFileName = path.join(__dirname, 'data/') + TEST_FILENAME_PREFIX + n + FILE_EXTENSION,
        exportFileName = path.join(__dirname, 'result/') + resultFileName,
        startTime;
        clf = new svm.CSVC({
            c: costs,
            kernelType:'LINEAR',
            probability : probability
        });
    Q.all([
        svm.read(trainFileName),
        svm.read(testFileName)
    ]).spread(function (trainingSet, testingSet) {
        startTime = new Date().getTime();
        return clf.train(trainingSet)
            .progress(function(progress){
                console.log('training progress: %d%', Math.round(progress*100));
            })
            .then(function () {
                return clf.evaluate(testingSet);
            });
    }).done(function (evaluationReport) {
        var time =  new Date().getTime() - startTime,
            timeString = 'It took ' + time + ' ms\n';
        console.log('Accuracy against the testset:\n', timeString + so(evaluationReport));
        fs.writeFile(exportFileName, timeString + so(evaluationReport), function(err) {
            if (err) throw err;
            console.log('It\'s saved!');
        })
    });

}
var mongoose = require('mongoose');
var Webpage = require('./models/webpage.js');

mongoose.connect('mongodb://52.28.85.224:27017/uebung3');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
    db.once('open', function (callback) {
      console.log("Connected to mongoDB!");
});

exports.storeWebpage = function(url, text, italian, callback){
    var newPage = new Webpage({ url:url, text:text, italian : italian});
    newPage.save(function (err, res) {
        if (err) {
            callback(err, false);
        } else {
            callback(null, true);
        }
    });
}

exports.getTrainingDocuments = function(callback) {
    Webpage.find({}, 'text italian', function(err, res) {
        if(err){
          callback(err);
        } else {
          callback(undefined, res);
        }
    });
}
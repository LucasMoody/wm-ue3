var mongoose = require('mongoose');
var Webpage = require('./models/webpage.js');
 

mongoose.connect('mongodb://52.28.85.224:27017/uebung3neu');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
    db.once('open', function (callback) {
      console.log("Connected to mongoDB!");
});

exports.storeWebpage = function(siteInfo, callback){
    var newPage = new Webpage(siteInfo);
    newPage.save(function (err, res) {
        if (err) {
            callback(err, false);
        } else {
            callback(null, true);
        }
    });
}

exports.getDocuments = function(callback) {
    Webpage.find({}, function(err, res) {
        if(err){
          callback(err);
        } else {
          callback(undefined, res);
        }
    }).limit(50);
}
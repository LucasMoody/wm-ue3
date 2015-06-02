var mongoose = require('mongoose');

var webpageSchema = new mongoose.Schema({
  url: String,
  text: String,
  italian : Boolean
});

module.exports = mongoose.model('webpage', webpageSchema);

var textkit = require('./textkit/textkit.js');

try {
    textkit.prepareDocuments(300, console.log);
}
catch(err){
    console.error(err);
}
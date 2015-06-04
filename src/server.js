var textkit = require('./textkit/textkit.js');

try {
    textkit.prepareDocuments(300, console.log);
}
catch(err){
    console.error(err);
}

var x = " Hallo ich bin 12 der , . ! ? / ////  ////////) ( ; ' ^";

var y = "Ü Ö ä Ä  ö ü 12 der , . ! ? / ////  ////////) ( ; ' ^";

// Bedeutung
// \w bedeutet sonderzeichen, underscores
// \s beduetet alle whitespaces
// /gi bedeutet global und case insensitive
y = y.replace(/[^\w\s Ä ä Ü ü Ö ö]/gi, '');

y=y.replace(/[0-9]/g, "");


console.log(y);


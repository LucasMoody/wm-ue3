var request = require('request');
var cheerio = require('cheerio');


var url = "http://www.chefkoch.de/rs/s0t29,28/Europa-Italien-Rezepte.html";

request(url, function(err, resp, body){
  $ = cheerio.load(body);
  links = $('a'); //jquery get all hyperlinks
  
  $(links).each(function(i, link){
    console.log($(link).text() + ':\n  ' + $(link).attr('href'));
  });
});
        
    


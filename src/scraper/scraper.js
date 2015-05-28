var request = require('request');
var cheerio = require('cheerio');

// Scrap italian receipts
var url = "http://www.chefkoch.de/rs/s0t28/Italien-Rezepte.html";

request(url, function(err, resp, body){
  $ = cheerio.load(body);

        
     $('span.rating-small').each(function(i, element){
      var a = $(this).prev();
      var a = a.attr('href');
      console.log("http://chefkoch.de/"+ a);
    });
  
});
        
   


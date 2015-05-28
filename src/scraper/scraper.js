var request = require('request');
var cheerio = require('cheerio');


var url = "http://www.chefkoch.de/rs/s0t28/Italien-Rezepte.html";


request(url, function(err, resp, body){
  $ = cheerio.load(body);
//  links = $('a'); //jquery get all hyperlinks
  
 // $(links).each(function(i, link){
  //  console.log($(link).text() + $(link).attr('href'));
 // });
  
   $('.recipe-result-col-1').filter(function(){

                var data = $(this);
               
                
                console.log(data);

            })
  
});
        
   


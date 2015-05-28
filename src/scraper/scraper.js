var request = require('request');
var cheerio = require('cheerio');

// Scrap italian receipts
var startpage = 0;
var scrape = function(){
    
// loop iterates over 15 pages and each page has 30 receipts
for(var i =0; i<15;i++){
   
    var url = "http://www.chefkoch.de/rs/s" + startpage +"t28/Italien-Rezepte.html";
    
    request(url, function(err, resp, body){
     $ = cheerio.load(body);
     
     $('span.rating-small').each(function(i,element){
      var a = $(this).prev();
      var url = "http://chefkoch.de"+a.attr('href');
      
      // How to trade an undefined link?
      if(url==="http://chefkoch.deundefined"){
          console.log("The link was undefined");
      }else{
           console.log(url);
           // insert into mongoDB here
           //  exports.storeWebpageSync("http://chefkoch.de"+ a,);
      }
     
     });
  
    });
     
     startpage+=30;
    }   
}
scrape();

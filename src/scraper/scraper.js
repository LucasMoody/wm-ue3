var request = require('request');
var cheerio = require('cheerio');

// Scrape italian receipts
var scrape = function(url,amount){
    var startpage = 0;
    var oldPage=0;
    var count =0;
// loop iterates ..cant stop it
for(var i =0; i<100;i++){
    

      url = url.replace("s"+oldPage,"s"+startpage);
       oldPage = startpage;
     
   
    request(url, function(err, resp, body){
     $ = cheerio.load(body);
     
     $('span.rating-small').each(function(i,element){
      var a = $(this).prev();
      var urlIntern = "http://chefkoch.de"+a.attr('href');
      
      // How to trade an undefined link?
      if(urlIntern==="http://chefkoch.deundefined"){
          console.log("The link was undefined");
      }else{
          if(count<amount){
               console.log(urlIntern);
           // insert into mongoDB here
           //  exports.storeWebpageSync("http://chefkoch.de"+ a,);
           count++;
          }
          
      }
     
     });
  
    });
     
     startpage+=30;
    }   
}

// Get the instruction text from the URLs (receipt)
var getContent = function(url){
    
     request(url, function(err, resp, body){
     $ = cheerio.load(body);
     $('.instructions').filter(function(){
          var text = $(this).text();
          console.log(text);
     });
    });
}




// Call functions
scrape("http://www.chefkoch.de/rs/s0t29,28/Europa-Italien-Rezepte.html",500);
//scrape("http://www.chefkoch.de/rs/s0t101/Afrika-Rezepte.html",500);
//getContent("http://www.chefkoch.de/rezepte/889601194503872/Knusprig-duenne-Pizza-mit-Chorizo-und-Mozzarella.html");







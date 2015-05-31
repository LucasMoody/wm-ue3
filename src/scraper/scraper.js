var request = require('request');
var cheerio = require('cheerio');

// Able to scrape a smaller number than 30 on the page.
function scrapeSmall(url,amount){
    
     request(url,function(err, resp, body){
         if(!err){
     $ = cheerio.load(body);
     
     $('span.rating-small').each(function(index){
       var a = $(this).prev().attr('href');
       if(a===undefined){
           var a = $(this).prev().prev().attr('href');
       }
       var urlIntern = "http://chefkoch.de"+a;
       if((index<amount) && (urlIntern!="http://chefkoch.deundefined")){
           console.log(urlIntern);
           //insert into mongoDB here
       }
    
     });
         }
});
}

// Scrapes all the links on the url
function scrapeChefkoch(url,max){
    
     request(url,function(err, resp, body){
         if(!err){
             
     $ = cheerio.load(body);
     
     $('span.rating-small').each(function(index){
       var a = $(this).prev().attr('href');
       if(a===undefined){
            var a = $(this).prev().prev().attr('href');
       }
       
       
       var urlIntern = "http://chefkoch.de"+a;
      
      // How to trade an undefined link?
      if(urlIntern==="http://chefkoch.deundefined"){
          console.log("The link was undefined");
      }else{
             console.log(urlIntern);
           // insert into mongoDB here
           //  exports.storeWebpageSync("http://chefkoch.de"+ a,);
          }
     });
         }
    });
}
// Scrape all links to the receipt page
// input: 
//       - startURL: the URL of the first page
//       - amount: the amount of receipts you want to scrape
function scrapeAll(startURL,amount){
    
    // Get each link from every page
    var amountOfPages = amount/30;
    var intvalue = Math.floor(amountOfPages);
    
    // Get the last couple links
    var restPages = amount%30;
    
    var count=0;
    var newPage=0;
    var oldPage=0;
    var tempURL=startURL;
    while(count<intvalue){
       
        tempURL = tempURL.replace("s"+oldPage,"s"+newPage);
        scrapeChefkoch(tempURL);
        oldPage=newPage;
        newPage+=30;
        count++;
    }
    startURL=startURL.replace("s0","s"+intvalue*30);
    scrapeSmall(startURL,restPages);
    
    
}

// Get the instruction text from the URLs (receipt)
function getContent(url){
    
     request(url, function(err, resp, body){
         if(!err){
     $ = cheerio.load(body);
     $('.instructions').filter(function(){
          var text = $(this).text();
          console.log(text);
     });
         }
    });
         
}




// Call functions

// Italian 500
scrapeAll("http://www.chefkoch.de/rs/s0t29,28/Europa-Italien-Rezepte.html",500);

// International
// Afrika 100
//scrapeAll("http://www.chefkoch.de/rs/s0t101/Afrika-Rezepte.html",100);

// Spain 100 
//scrapeAll("http://www.chefkoch.de/rs/s0t29,43/Europa-Spanien-Rezepte.html",100);

// German 100
//scrapeAll("http://www.chefkoch.de/rs/s0t29,65/Europa-Deutschland-Rezepte.html",100);

// French 100
//scrapeAll("http://www.chefkoch.de/rs/s0t29,84/Europa-Frankreich-Rezepte.html",100);

// Australia 100
//scrapeAll("http://www.chefkoch.de/rs/s0t145/Australien-Rezepte.html",100);


//getContent("http://www.chefkoch.de/rezepte/889601194503872/Knusprig-duenne-Pizza-mit-Chorizo-und-Mozzarella.html");







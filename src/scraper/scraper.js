var request = require('request');
var cheerio = require('cheerio');
var mongo = require("../dbconnection/mongo-con.js");

// Able to scrape a smaller number than 30 on the page.
function scrapeSmall(url,amount, italian){
    
    request(url,function(err, resp, body){
        if(!err){

            $ = cheerio.load(body);

            $('.rowclick').each(function(index){

                var a = $(this).attr('data-url');
                var urlIntern = "http://chefkoch.de"+a;
                if(index<amount){

                    var dataset = {
                        url : urlIntern,
                        text : body,
                        italian : italian
                    };

                    console.log(dataset.italian);
    
                    mongo.storeWebpage(dataset,function(err,succ){
    
                        if(err){
                            console.error(err);
                        } else {
                            console.log("mongo store finished");
                        }    
    
                    });

                }
            });
        }
    });
}

// Scrapes all the links on the url
function scrapeChefkoch(url,italian){
    
    request(url,function(err, resp, body){
        if(!err){
             
            $ = cheerio.load(body);
            $('.rowclick').each(function(index){
                var a = $(this).attr('data-url');
                var urlIntern = "http://chefkoch.de"+a;
      
                var dataset = {
                    url : urlIntern,
                    text : body,
                    italian : italian
                };
                console.log(dataset.italian);

                mongo.storeWebpage(dataset,function(err,succ){
                    if(err){
                        console.error(err);
                    } else {
                        console.log("mongo store finished");
                    }
                })
            });

         }
    });
}
// Scrape all links to the receipt page
// input: 
//       - startURL: the URL of the first page
//       - amount: the amount of receipts you want to scrape
function scrapeAll(startURL,amount,italian){
    
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
        scrapeChefkoch(tempURL,italian);
        oldPage=newPage;
        newPage+=30;
        count++;
    }
    startURL=startURL.replace("s0","s"+intvalue*30);
    scrapeSmall(startURL,restPages,italian);
    
    
}

// Get the instruction text from the URLs (receipt)
// Problem: Can only print the output but can't implement a return statement...
function getContent(html){
     
     $ = cheerio.load(html);
    
     $('.instructions').filter(function(){
         
         var output = $(this).text().trim().toLowerCase();
         return output;
        
     });
        
}

// Call functions

// Italian 500
scrapeAll("http://www.chefkoch.de/rs/s0t29,28/Europa-Italien-Rezepte.html",500,true);

// International
// Afrika 100
scrapeAll("http://www.chefkoch.de/rs/s0t101/Afrika-Rezepte.html",100,false);

// Spain 100 
scrapeAll("http://www.chefkoch.de/rs/s0t29,43/Europa-Spanien-Rezepte.html",100,false);

// German 100
scrapeAll("http://www.chefkoch.de/rs/s0t29,65/Europa-Deutschland-Rezepte.html",100,false);

// French 100
scrapeAll("http://www.chefkoch.de/rs/s0t29,84/Europa-Frankreich-Rezepte.html",100,false);

// Australia 100
scrapeAll("http://www.chefkoch.de/rs/s0t145/Australien-Rezepte.html",100,false);

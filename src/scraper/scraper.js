var request = require('request');
var cheerio = require('cheerio');

// JS Objects
function Data (id,url,text) {
    this.id=id;
    this.url = url;
    this.text = text;
    this.getURL = getURL;
    this.getText = getText;
}

function getID(){
    return this.id;
}
 
function getURL() {
    return this.url;
}

function getText() {
    return this.text;
}

// Able to scrape a smaller number than 30 on the page.
function scrapeSmall(url,amount){
    
     request(url,function(err, resp, body){
         if(!err){
     $ = cheerio.load(body);
     
     $('.rowclick').each(function(index){
     var a = $(this).attr('data-url');
       var urlIntern = "http://chefkoch.de"+a;
       if(index<amount){
           var dataset = new Data("Italian",urlIntern,getHTML(urlIntern));
           console.log(dataset.id);
           console.log(dataset.url);
           console.log(dataset.getText());
           //////////////////////////////////
           //insert dataset into mongoDB here
           /////////////////////////////////
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
     
     $('.rowclick').each(function(index){
      var a = $(this).attr('data-url');
      var urlIntern = "http://chefkoch.de"+a;

            var dataset = new Data("Italian",urlIntern,getHTML(urlIntern));
            console.log(dataset.id);
            console.log(dataset.getURL());
            console.log(dataset.getText());
            /////////////////////////////////
           // insert dataset into mongoDB here
           //////////////////////////////////
          
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
// Problem: Can only print the output but can't implement a return statement...
function getContent(url){
     
     request(url,function(err, resp, body){
         if(!err){
     $ = cheerio.load(body);
    
     $('.instructions').filter(function(){
         
         var output = $(this).text().trim();
         return output;
        
     });
         }
         
    });

}

function getHTML(url){
    // do smth
    return "Here goes the text from the url: " + url;
}




// Call functions


// Italian 500
scrapeAll("http://www.chefkoch.de/rs/s0t29,28/Europa-Italien-Rezepte.html",100);

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






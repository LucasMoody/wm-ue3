// Stoppwort-Filterung und Stemming
// Wenden Sie auf die Liste von Wörtern Stoppwort-Filterung und Stemming an. Beachten Sie zu Stemming die Hinweise am Ende.

// Wort-Liste zu TF-IDF-Vektor
// Wählen Sie als Menge der Terme alle Wörter, die in den Wort-Listen des Trainingssets auftauchen. Bilden Sie für jedes Dokument den TF-IDF-Vektor, indem Sie für jeden Term seine relative Häufigkeit innerhalb des Dokuments (TF) mit seiner logarithmierten inversen Document Frequency (IDF) multiplizieren (siehe Folien).
// Hinweis: Sowohl die Definition der Termmenge als auch die IDF-Werte werden allein anhand des Trainingssets erstellt und beim Testen wiederverwendet. Denn abgesehen von der konkreten Testinstanz sollen keine Informationen aus dem Testset in die Klassifikation einfließen.

// Einfache Feature-Selection
// Ihr Programm sollte in der Lage sein, die relevantesten N Wörter (Features) zu selektieren. Sortieren sie dabei einfach die Wörter nach ihrer Dokumenthäufigkeit im Trainingsset und behalten sie die N häufigsten. 

function getRecipeDivText(htmlDocuments) {
    
}

function getRecipeBodyText(htmlDocuments) {
    
}

function documentToWordList(){
    
}


function retrieveFromDb(){
    
    return // [{url:"xxx", text:"yyy", italian:"TRUE"}]
}

exports.prepareDocuments = function(){
    var htmlDocuments = retrieveFromDb();
    var documents = getRecipeBodyText(htmlDocuments);
    var documents = getRecipeDivText(htmlDocuments); //alternativ
    
}

function
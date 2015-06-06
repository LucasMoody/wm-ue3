var textkit = require('./textkit/textkit.js'),
	svm = require('./classifier/svm.js');


function prepareFiles(n) {
	try {
	    textkit.prepareDocuments(n, false, function(err, succ) {
	    	svm.startSVMClassifier(n,50,false,'ex3.2-'+n+'.txt');
	    	if (err) throw err;
	    	prepareFiles(n*2);
	    });
	}
	catch(err){
	    throw err;
	}
}

function ex31() {
	textkit.prepareDocuments(1000, false, function(err, succ) {
		if(err) throw err;
    	svm.startSVMClassifier(1000,50,false,'ex3.1.txt');
    });
}

function ex33(){
	prepareFiles(5);
}

function ex32() {
	svm.startSVMClassifier(1000,50,true,'ex3.3.txt');
}

ex31();
//ex32();
//ex33();

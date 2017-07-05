var connect = require('connect');
var express = require('express');
var bodyParser = require('body-parser');
var Chance = require('chance');
var crypto = require('crypto');
var mysql  = require('mysql');
var cors = require('cors');

var app = express();

app.use(express.static('public_html'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true}));


var conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'me',
    password : 'myPass',
    database : 'myDB'
});

conn.connect(function(err) {
    if (err) {
	console.error('error connecting: ' + err.stack);
	return;
    }
    
});

//recebe pedidos post
app.post('/register', function (req, res) {
    
    if (req.body.name && req.body.pass && Object.keys(req.body).length==2) {
	
	chance = new Chance();
	
	var namePOST    = req.body.name;
	var passPOST    = req.body.pass;
	var salt        = chance.string({length: 4}); 
	var passHex     = saltHashPassword(passPOST,salt,32);
		
	
	conn.query('SELECT * FROM Users', function(err, results) {
	    if (err) 
		throw err   
	    
	    for (var i=0;i<results.length;i++) {

		
		if (results[i].name == namePOST) { //nome ja existe
		    
		    var passDB = results[i].pass;
		    var saltDB = results[i].salt;
		    var pass   = saltHashPassword(passPOST,saltDB,32);
		    
		    if (pass != passDB) { //pass é diferente
//			console.log("login falhado");
//			console.log(passDB + " " + pass);
			res.json({"error": "User registered with a different password"});	
			break;
		    }
		    else {
//			console.log("OK. Login bem sucedido"); //login bem sucedido
			res.json({});
			break;
		    }
		}
	    }
//	    console.log(i + " " + results.length);
	    if (i==results.length) { 		
		conn.query('INSERT INTO Users (name, pass, salt) VALUES (?, ?, ?)', [namePOST,passHex, salt], function(err, result) {
		    res.json({});
		});
	    }
	});
    }
    else {
	console.log("Erro: Parametros inválidos");
    }
});


var md5 = function(password, salt,length){
    var hash = crypto.createHmac('md5', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return (value.substring(0,length));
};

function saltHashPassword(salt, userpassword,length) {
    return md5(userpassword, salt,length);
}

app.post('/ranking', function (req, res) {
    var conn = mysql.createConnection({
	host     : 'localhost',
	user     : 'me',
	password : 'myPass',
	database : 'myDB'
    });
    
    conn.connect(function(err) {
	if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	}
    });
    
    if (req.body.level && (Object.keys(req.body).length==1)) {
	var level = req.body.level;
    
	conn.query('SELECT name FROM Rankings WHERE level=(?) ORDER BY boxes DESC, time ASC',[level],function(err, results) {
	    if (err) 
		throw err
	    
	    var post = {
		"ranking": []
	    }
	    
	    for (var i=0;i<results.length;i++) {
		var name = results[i].name;
//		console.log(name);
		post.ranking.push({
		    "name" : name
		});   
	    }
	    res.json(post);
	});
    }
    else {
	console.log("Erro: Parametros invalidos");
    }
});


app.listen(8047);

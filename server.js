var express = require('express');
var app = express();

var formidable = require('formidable');
const path = require('path')
var fs = require('fs');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('Main');
});

app.get('/Login', function(req, res) {
    res.render('Login', {msg: ''});
});

//Only allow access to admin page via successful login
app.get('/Admin', function(req, res) {
    res.render('Login', {msg: ''});
});

app.post('/login', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true

	form.parse(req, function(err, fields, files) {
        //Query database for username and hashed psasword
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");

            dbo.collection("pictures").find({"user": fields.user}).toArray(function(err, result) {
                if (err) throw err;
                bcrypt.compare(fields.pass, result[0].pass, function(err, re) {
                    if (re === true) {
                        res.render('Admin', {msg: ''});
                    }
                    else {
                        res.render('Login', {msg: 'Wrong username/password'});
                    }
                });
                db.close();
            });
        });
    });
});

app.post('/upload', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.keepExtensions = true

    //form.uploadDir = (__dirname + '/uploads');
	form.parse(req, function(err, fields, files) {
        console.log(fields);
        console.log(files);
        res.render('Admin', {msg: 'Success'});
    });
});

var port = 7000;
app.listen(port);
console.log('Listening on: ' + port);
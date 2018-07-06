var express = require('express');
var app = express();

var formidable = require('formidable');
const path = require('path')
var fs = require('fs');

var mongo = require('mongodb');
var binary = require('mongodb').Binary;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var bcrypt = require('bcrypt');

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
        //Query database for username and hashed password
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

	form.parse(req, function(err, fields, files) {
        console.log(fields.title_text);
        console.log(files.picture_file.name);

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            var bdata = fs.readFileSync(files.picture_file.path);;
            var obj = {title: fields.title_text, description: fields.des_text, picture: files.picture_file.name, data: binary(bdata)};

            dbo.collection("pictures").insertOne(obj, function(err, re) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
                res.render('Admin', {msg: 'Success'});
            });
        });
    });
});

var port = 7000;
app.listen(port);
console.log('Listening on: ' + port);
'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var fsExtend = require('./Modules/extendFS'); //Used to shorten opening of files
var email = require('./Modules/email');
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

app.listen(port);

// set the home page route
app.get('/', function (req, res) {
    res.render('pages/Home');
});
app.get('/game', function (req, res) {
    res.render('pages/SeniorGame');
});
app.get('/distort', function (req, res) {
    res.render('pages/ImageDistort');
});
app.get('/distance', function (req, res) {
    res.render('pages/Distance');
});
app.get('/resume', function (req, res) {
    fsExtend.readExtend('Files/Resume.pdf', 'text/pdf', res);
});
app.get('/engagement', function (req, res) {
    fsExtend.readExtend('Files/ProfilePic.jpg', 'image/jpeg', res);
});


process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    })
});

process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node.js docs)
});



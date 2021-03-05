'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var fs = require('fs');
var fsExtend = require('./Modules/extendFS'); //Used to shorten opening of files
var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function (req, res) {

    // ejs render automatically looks in the views folder
    res.render('index');
});

http.createServer(function (req, res) {
    switch (req.url) {
        case '/': 
            fsExtend.readExtend('views/Home.html', 'text/html', res);
            break;
        case '/game':
            fsExtend.readExtend('views/SeniorGame.html', 'text/html', res);
            break;
        case '/distort':
            fsExtend.readExtend('views/ImageDistort.html', 'text/html', res);
            break;
        case '/distance':
            fsExtend.readExtend('views/Distance.html', 'text/html', res);
            break;
        case '/resume':
            fsExtend.readExtend('Files/Resume.pdf', 'text/pdf', res);
            break;
        case '/engagement':
            fsExtend.readExtend('Files/ProfilePic.jpg', 'image/jpeg', res);
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.write("<h1>No page found!</h1>");
            res.end();
            break;
    }
}).listen(port);

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated')
    })
})

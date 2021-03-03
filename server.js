'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var fs = require('fs');

http.createServer(function (req, res) {
    switch (req.url) {
        case '/': 
            fs.readFile('Home.html', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            });
            break;
        case '/game':
            fs.readFile('SeniorGame.html', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            });
            break;
        case '/distort':
            fs.readFile('ImageDistort.html', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            });
            break;
        case '/distance':
            fs.readFile('Distance.html', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            });
            break;
        default:
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.write("<h1>No page found!</h1>");
            res.end();
            break;
    }
}).listen(port);

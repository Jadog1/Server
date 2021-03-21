'use strict';
require('dotenv').config();
var port = process.env.PORT || 1337;
var fsExtend = require('./Modules/extendFS'); //Used to shorten opening of files
var email = require('./Modules/email');
var queries = require('./Modules/queries');
var dealFinder = require('./Modules/DealFinder');
var express = require('express');
var app = express();
const bodyParser = require('body-parser');

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port);

async function test() {
    try {
        //await queries.addUser("appUser11", "myHashed");
        //await queries.addGoal(100.23, "myHashed2", 17, "12-22-2021", true, 0);
        return await queries.getGoalByBudget(17);
    } catch (e) {
        console.log("Error: " + e);
    }
}

// set the home page route
app.get('/', async function (req, res) {
    //console.log(await test());
    res.render('pages/Home');
});
app.get('/projects/game', function (req, res) {
    res.render('pages/SeniorGame');
});
app.get('/projects/distort', function (req, res) {
    res.render('pages/ImageDistort');
});
app.get('/projects/distance', function (req, res) {
    res.render('pages/Distance');
});
app.get('/projects/gamble', function (req, res) {
    res.render('pages/gambling');
});
app.get('/projects/graph', function (req, res) {
    res.render('pages/graph');
});
app.get('/about', function (req, res) {
    res.render('pages/AboutMe');
});
app.get('/projects', function (req, res) {
    res.render('pages/Projects');
});
app.get('/contact', function (req, res) {
    res.render('pages/Contact');
});
app.get('/finance/login', function (req, res) {
    res.render('pages/finance/login', { error: "" });
});

//Post
app.post('/finance/login', async function (req, res) {
    try {
        if (req.body.username.trim() == "" || req.body.password.trim() == "")
            res.render('pages/finance/login', { error: "Fields cannot be blank" });
        if (await queries.verifyUser(req.body.username, req.body.password)) {
            const user = await queries.getUser(req.body.username);
            res.render('pages/finance/home', { contact_id: user });
        } else {
            res.render('pages/finance/login', { error: "Username/password does not exist" });
        }
    } catch (e) {
        console.log(e);
        res.render('pages/finance/login', { error: "Unknown error occured" });
    }
});

//Post
app.post('/finance/register', async function (req, res) {
    if (req.body.username.trim() == "" || req.body.password.trim() == "")
        res.render('pages/finance/login', { error: "Fields cannot be blank" });
    try {
        await queries.addUser(req.body.username, req.body.password);
        const user = await queries.getUser(req.body.username);
        res.render('pages/finance/home', { contact_id: user });
    } catch (e) {
        if (e.code == 23505)
            res.render('pages/finance/login', { error: "Username already exists" });
        else if (e.code == 23502)
            res.render('pages/finance/login', { error: "Fields cannot be blank" });
        else {
            console.log(e);
            res.render('pages/finance/login', { error: "Unknown error, try again" });
        }
    }
});

//Get files
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



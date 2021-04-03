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
const oneDayToSeconds = 24 * 60 * 60 * 1000;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port);
app.enable('trust proxy'); // optional, not needed for secure cookies

// returns an object with the cookies' name as keys
const getAppCookies = (req) => {
    //console.log(req.headers.cookie);
    try {
        // We extract the raw cookies from the request headers
        const rawCookies = req.headers.cookie.split('; ');
        // rawCookies = ['myapp=secretcookie, 'analytics_cookie=beacon;']

        const parsedCookies = {};
        rawCookies.forEach(rawCookie => {
            const parsedCookie = rawCookie.split('=');
            // parsedCookie = ['myapp', 'secretcookie'], ['analytics_cookie', 'beacon']
            parsedCookies[parsedCookie[0]] = parsedCookie[1];
        });
        return parsedCookies;
    } catch (e) {
        return {};
    }
};

function isLogged(req) {
    if (req == undefined || req == "undefined")
        return false;
    else
        return true;
}

app.all('*', function (req, res, next) {

    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

// set the home page route
app.get('/', async function (req, res) {
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
app.get('/finance/expense-list', async function (req, res) {
    const expenses = await queries.getExpenseByBudget(req.query.budgetId);
    res.json(expenses);
});
app.get('/finance/budget-list', async function (req, res) {
    const userId = getAppCookies(req)['userId'];
    if (isLogged(userId)) {
        const budgets = await queries.getBudgetByUser(userId);
        res.json(budgets);
    } else
        res.json({'Error': 'Account not logged in'});
});
app.get('/finance/deleteBudget', async function (req, res) {
    try {
        const deleteBudget = await queries.deleteBudget(req.query.budgetId);
        res.status(200);
        res.json({success: "OK"});
    } catch (e) {
        res.status(400);
        res.json({ error: 'Error has occured' });
    }
});
app.get('/finance/login', function (req, res) {
    const userId = getAppCookies(req)['userId'];
    if (isLogged(userId) == false)
        res.render('pages/finance/login', { error: "" });
    else
        res.redirect('/finance/home');
});
app.get('/finance/home', async function (req, res) {
    const userId = getAppCookies(req)['userId'];
    if (isLogged(userId)) {
        const budget = await queries.getBudgetByUser(userId);
        res.render('pages/finance/home', { budget: JSON.stringify(budget) });
    } else
        res.redirect('/finance/login');
});
app.get('/finance/logout', function (req, res) {
    res.cookie('userId', undefined,
        {
            proxy: true, // add this when behind a reverse proxy, if you need secure cookies
            maxAge: oneDayToSeconds,
            // You can't access these tokens in the client's javascript
            httpOnly: true,
            // Forces to use https in production
            secure: false
        });
    res.redirect('/finance/login');
});

//Post
app.post('/finance/login', async function (req, res) {
    try {
        if (req.body.username.trim() == "" || req.body.password.trim() == "")
            res.render('pages/finance/login', { error: "Fields cannot be blank" });
        if (await queries.verifyUser(req.body.username, req.body.password)) {
            const user = await queries.getUser(req.body.username);
            res.cookie('userId', user,
                {
                    proxy: true, // add this when behind a reverse proxy, if you need secure cookies
                    maxAge: oneDayToSeconds,
                    // You can't access these tokens in the client's javascript
                    // You can't access these tokens in the client's javascript
                    httpOnly: true,
                    // Forces to use https in production
                    secure: false
                });
            res.redirect('/finance/home');
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
        res.cookie('userId', user,
            {
                proxy: true, // add this when behind a reverse proxy, if you need secure cookies
                maxAge: oneDayToSeconds,
                // You can't access these tokens in the client's javascript
                httpOnly: true,
                // Forces to use https in production
                secure: false
            });
        res.redirect('/finance/home');
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

let jsonParser = bodyParser.json();

app.post('/finance/addBudget', jsonParser, async function (req, res) {
    if (req.body.salary.trim() == "" || req.body.accountName.trim() == "") {
        res.status(400);
        res.json({ error: "Fields blank" });
    }
    try {
        const userId = getAppCookies(req)['userId'];
        if (isLogged(userId)) {
            await queries.addBudget(req.body.salary, req.body.accountName, userId);
            res.status(201);
            res.json({ success: "OK" });
        } else {
            res.status(401);
            res.json({ error: "Unauthorized" });
        }
    } catch (e) {
        res.status(400);
        if (e.code == 23505)
            res.json({ error: "Username already exists" });
        else if (e.code == 23502)
            res.json({ error: "Fields cannot be blank" });
        else {
            console.log(e);
            res.json({ error: "Unknown error, try again" });
        }
    }
});


app.post('/finance/addExpense', jsonParser, async function (req, res) {
    if (req.body.expenseName.trim() == "" || req.body.amount.trim() == "") {
        res.status(400);
        res.json({ error: "Fields blank" });
    }
    try {
        await queries.addExpense(req.body.amount, req.body.expenseName, req.body.budgetId);
        res.status(201);
        res.json({ success: "OK" });
    } catch (e) {
        res.status(400);
        if (e.code == 23505)
            res.json({ error: "Username already exists" });
        else if (e.code == 23502)
            res.json({ error: "Fields cannot be blank" });
        else {
            console.log(e);
            res.json({ error: "Unknown error, try again" });
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



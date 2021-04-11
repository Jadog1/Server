'use strict';
require('dotenv').config();
var port = process.env.PORT || 1337;
var fsExtend = require('./Modules/extendFS'); //Used to shorten opening of files
var email = require('./Modules/email');
var queries = require('./Modules/queries');
var dealFinder = require('./Modules/DealFinder');
var express = require('express');
const request = require('request');
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
async function getWeather() {

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
app.get('/weather', async function (req, res) {
    fsExtend.getLastModified("JsonObjects/Weather.json")
        .then(data => {
            if (data > 3600) {
                request('http://api.openweathermap.org/data/2.5/weather?zip=46815&units=Imperial&appid=9410d5ee060c34e41021b0fb8f1a9110', { json: true }, (err, res2, body) => {
                    if (err) { return console.log(err); }
                    fsExtend.writeAFile("JsonObjects/Weather.json", JSON.stringify(body));
                    res.json(body);
                });
            } else {
                fsExtend.readAFile("JsonObjects/Weather.json")
                    .then(data => {
                        res.json(JSON.parse(data));
                    })
                    .catch(err => {
                        res.json(null);
                    })
            }
        })
        .catch(err => {
            console.log("Error!");
        })
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
app.get('/projects/distanceNew', function (req, res) {
    res.render('pages/DistanceNew');
});
app.get('/projects/gamble', function (req, res) {
    res.render('pages/gambling');
});
app.get('/projects/graph', function (req, res) {
    res.render('pages/graph');
});
app.get('/projects', function (req, res) {
    res.render('pages/Projects');
});
app.get('/contact', function (req, res) {
    res.render('pages/Contact');
});
app.get('/finance/expense-list', async function (req, res) {
    const expenses = await queries.getOnlyExpenseByBudget(req.query.budgetId);
    const goals = await queries.getGoalByBudget(req.query.budgetId)
    res.json(expenses.concat(goals));
});
app.get('/finance/budget-list', async function (req, res) {
    const userId = getAppCookies(req)['userId'];
    if (isLogged(userId)) {
        const budgets = await queries.getBudgetByUser(userId);
        res.json(budgets);
    } else
        res.json({ 'Error': 'Account not logged in' });
});
app.get('/finance/updateBudgetTax', async function (req, res) {
    try {
        await queries.updateTaxRate(req.query.budgetId, req.query.taxRate);
        res.status(200);
        res.json({ success: "OK" });
    } catch (e) {
        console.log(e);
        res.status(400);
        res.json({ error: 'Error has occured' });
    }
});
app.get('/finance/deleteBudget', async function (req, res) {
    try {
        await queries.deleteBudget(req.query.budgetId);
        res.status(200);
        res.json({ success: "OK" });
    } catch (e) {
        res.status(400);
        res.json({ error: 'Error has occured' });
    }
});
app.get('/finance/deleteExpense', async function (req, res) {
    try {
        await queries.deleteExpense(req.query.expenseId);
        res.status(200);
        res.json({ success: "OK" });
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
            return;
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
        return;
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
            await queries.addBudget(req.body.salary, req.body.accountName, userId, req.body.taxRate);
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
    try {
        if (req.body.goal)
            await queries.addGoal(req.body.amount, req.body.expenseName, req.body.budgetId, req.body.date, req.body.optional, req.body.amountPaid);
        else
            await queries.addExpense(req.body.amount, req.body.expenseName, req.body.budgetId);
        res.status(201);
        res.json({ success: "OK" });
    } catch (e) {
        res.status(400);
        if (e.code == 23505)
            res.json({ error: "Expense already exists" });
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
app.get('/currentDepots', function (req, res) {
    fsExtend.readExtend('JsonObjects/CurrentCachedDepots.json', 'application/json', res);
});
app.get('/allDepots', function (req, res) {
    fsExtend.readExtend('JsonObjects/AllCachedDepots.json', 'application/json', res);
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



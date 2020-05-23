const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config/config.json');
const mailer = require('./utils/mailer.js')
require('dotenv').config();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set paths
app.set('views', [
    path.join(__dirname, '/views'),
    path.join(__dirname, '/views/partials'),
    path.join(__dirname, '/views/pages')
]);
app.use(express.static(__dirname + '/public'));

// Set template engine
app.set('view engine', 'ejs');

app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true
}));


const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 8 // limit each IP to 8 requests per windowMs
});

app.use('/signup', authLimiter);
app.use('/login', authLimiter);

/* Setup Knex with Objection */

const { Model } = require('objection');
const Knex = require('knex');
const knexfile = require('./knexfile.js');

const knex = Knex(knexfile.development);

Model.knex(knex);

/* Setup the routes with app */
/* app.use((req, res, next) => {
    console.log("Time of request: ", new Date());
    next();
}); */

const authRoute = require('./routes/auth.js');
const usersRoute = require('./routes/users.js');

app.use(authRoute);
app.use(usersRoute);


const PORT = 3000;

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    }
    console.log("Server is running on the port", PORT);
})
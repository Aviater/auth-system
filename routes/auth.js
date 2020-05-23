const router = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config.json');
const utils = require('../utils/mailer.js');
const crypto = require('crypto');

const User = require("../models/User.js");

const bcrypt = require('bcrypt');
const saltRounds = 12;

authenticateToken = (req, res, next) => {
    const accessToken = req.session.token;
    console.log(accessToken);
    if(typeof accessToken !== 'undefined') {
        jwt.verify(accessToken, config.tokenSecret, (err, user) => {
            if(err) {
                console.log('Token verification error:', err)
                return res.sendStatus(403)
            } else {
                req.user = user
                next();
            }
        })
    } else {
        res.sendStatus(403)
    }
}

router.get('/login', (req, res) => {
    res.render('pages/login');
});

router.post('/login', (req, res) => {
    // 1. Get the data from the request
    const {username, password} = req.body;
    // 2. Validate the data
    if(username && password.length > 8) {
        try {
            // 3. Check if user exists and get their password
            User.query().select('password').where('username', username).then(foundUser => {
                if(foundUser.length > 0) {
                    // 4. Bcrypt compare
                    bcrypt.compare(req.body.password, foundUser[0].password)
                        // 5. Send a response based on the comparison
                        .then(response => {
                            if(response) {
                                console.log(response);
                                console.log('password match!');

                                const accessToken = jwt.sign({username}, config.tokenSecret);
                                req.session.token = accessToken;
                                
                                return res.redirect(`/landing?username=${username}`);
                            } else {
                                console.log(response);
                                return res.status(400).send({ response: "Password is incorrect" });
                            }
                        });
                        
                        // res.setHeader('Some', 'thing')
                        
                } else {
                    return res.status(400).send({ response: "User not found" });
                }
            })
        } catch(err) {
            console.log('Database access error:', err);
            return res.status(500).send({ response: "Database access error" });
        }
    } else {
        return res.status(501).send({ response: "Username must be entered and password must be longer than 8 characters." });
    }    
});

router.get('/signup', (req, res) => {
    res.render('pages/signup');
});

router.post('/signup', (req, res) => {
    const { username, password } = req.body;

    if (username.search('@') !== -1 && username.search('.') !== -1) {
        // password validation
        if (password.length < 8) {
            return res.status(400).send({ response: "Password must be 8 characters or longer" });
        } else {
            try {
                User.query().select('username').where('username', username).then(foundUser => {
                    if (foundUser.length > 0) {
                        return res.status(400).send({ response: "User already exists" });
                    } else {
                        bcrypt.hash(password, saltRounds).then(hashedPassword => {
                            User.query().insert({
                                username,
                                password: hashedPassword
                            }).then(createdUser => {
                                return res.send({ response: `The user ${createdUser.username} was created` });
                            });
                        });
                    }
                });
            } catch (error) {
                return res.status(500).send({ response: "Something went wrong with the DB" });
            }
        }
    } else {
        return res.status(400).send({ response: "Username must be an email address" });
    }
});

router.get('/reset-password', (req, res) => {
    res.render('pages/reset-password');
});

router.post('/send-reset-email', (req, res) => {
    const newPassword = crypto.randomBytes(8).toString('base64');
    console.log(newPassword);
    const email = req.body.email;
    if (email.search('@') !== -1 && email.search('.') !== -1) {
        try {
            bcrypt.hash(newPassword, saltRounds).then(hashedPassword => {
                User.query().where('username', email).update({password: hashedPassword})
                    .then(response => {
                        utils.sendMail(email, newPassword);
                        return res.redirect('/login');
                    });
            });
        } catch(err) {
            return res.status(500).send({ response: "User not found" });
        }
    } else {
        return res.status(400).send({ response: "Email is not valid" });
    }


    // res.redirect('/login');
});

// Secure routes
router.get('/landing', authenticateToken, (req, res) => {
    res.render('pages/landing', {username: req.query.username});
});

router.get('/about', authenticateToken, (req, res) => {
    res.render('pages/about', {username: req.query.username});
});

router.get('/logout', (req, res) => {
    req.session.token = '';
    console.log(req.session.token);
    return res.redirect('/login');
});

module.exports = router;

// $2b$12$62kg.IYPVdX0OlaGm4U.4eHG7eKEb0zrjo55/nhJo/dRwNSKjhhsm
// $2b$12$62kg.IYPVdX0OlaGm4U.4eHG7eKEb0zrjo55/nhJo/dRwNSKjhhsm
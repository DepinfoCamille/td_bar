'use strict';
const Express = require('express');
const router = Express.Router();

const Passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const DB = require('../db.js');

Passport.use(new BasicStrategy((username, password,  done) => {

        DB.get('SELECT * FROM USERS WHERE USERNAME = ?' ,[username], (err, user) => {

            if (err) {
                console.error(err.message);
                return done(err);
            }
            if (!user) {
                console.log('Bad username')
                return done(null, false, { message: 'Incorrect username' });
            }
            if (password !== user.PASSWORD) {
                console.log('Bad password');
                return done(null, false, {message:'Incorrect password'});
            }
            return done(null, user);
        });
}));

router.get('/login', Passport.authenticate('basic', { session: false }), (req, res) => {

    res.end('Hello ' + req.user.USERNAME);
});

module.exports.router = router;


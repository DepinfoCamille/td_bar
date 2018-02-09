'use strict';
const Express = require('express');
const Joi = require('joi');
const Celebrate = require('celebrate');

const DB = require('../db.js');

const router = Express.Router();

// Ajout de l'authentification
const BasicStrategy = require('passport-http').BasicStrategy;


const Passport = require('passport', BasicStrategy);

// Routers

router.get('/', (req, res, next) => {

    console.log('GET /bottles');
    DB.all('SELECT * FROM BOTTLES', (err, data) => {

        if (err) {
            console.log("erreur dans get all") ; 
            return next(err);
        }
        return res.json(data);
    });
});

router.get('/:id', (req, res, next) => {

    DB.get('SELECT * FROM BOTTLES WHERE ID = ?', [req.params.id], (err, data) => {

        if (err) {
            return next(err);
        }
        return res.json(data);
    });
});

router.post('/', Celebrate.celebrate({

    body: Joi.object().keys({
        brand: Joi.string().required(),
        price: Joi.number().min(0).required(),
        volume: Joi.number().integer().min(0).required(),
        count: Joi.number().integer().min(0).required()
    })
    })
    , Passport.authenticate('basic', {session: false}) // user need to be an admin
    ,(req, res) => {

        if(req.user){
            if(req.user.STATUS !== 'admin'){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }

        console.log('INSERT new bottle of' + req.body.brand);
        DB.run('INSERT INTO BOTTLES (BRAND, PRICE, VOLUME, COUNT) VALUES (?,?,?,?)', 
                [req.body.brand, req.body.price, req.body.volume, req.body.count], (err) => {

            if (err) {
                return console.error(err.message);
            }
            res.status(201);
            res.end("Insertion successful") ; 

        });
});

router.patch('/:id', Celebrate.celebrate({

    body: Joi.object().keys({
        brand: Joi.string().required(),
        price: Joi.number().min(0).required(),
        volume: Joi.number().integer().min(0).required(),
        count: Joi.number().integer().min(0).required()
    })
    })
    , Passport.authenticate('basic', {session: false}) // user need to be a user
    ,(req, res) => {
        console.log("Dans authenticate") ; 
        if(req.user){
            if(req.user.STATUS !== 'admin' && req.user.STATUS !=="user"){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }

        console.log('update the bottle of id ' + req.params.id);
            DB.run('UPDATE BOTTLES SET BRAND=?, PRICE=?, VOLUME=?, COUNT=? WHERE ID=?', 
                [req.body.brand, req.body.price, req.body.volume, req.body.count, req.params.id], (err) => {

            if (err) {
                return console.error(err.message);
            }
            res.status(201);
            res.end("Update successful") ; 
        });
});

router.delete('/:id'
    , Passport.authenticate('basic', {session: false}) // user need to be an admin
    , (req, res, next) => {


        if(req.user){
            if(req.user.STATUS !== 'admin'){
                res.status(403);
                return res.end('You are not authorized to access this section.')
            }
        }

    DB.run('DELETE FROM BOTTLES WHERE ID = ?', [req.params.id], (err) => {

        if (err) {
            return next(err);
        }
        return res.end("Deletion successful");
    });
});


module.exports.router = router;

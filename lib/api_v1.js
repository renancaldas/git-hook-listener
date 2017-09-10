'use strict';

/* NPM Dependencies
---------------------------------*/
const express = require('express');
const actions = require('./actions.js');

/* Routers
---------------------------------*/
const router = express.Router();

router.route('/test')
  .get(function(req, res, next) {  
  		res.status(200).send('Ready to use POST /hook endpoint! \n');
  });

router.route('/update')
  .post(function(req, res, next) {  
		res.status(200).send('Webhook Received. Please check the monitor for more information.');
  		actions.update();
  });


router.route('/hook')
  .post(function(req, res, next) { 
		res.status(200).send('Webhook Received. Please check the monitor for more information.');
		actions.processHook(req.headers, req.body);
  });

/* Module 
---------------------------------*/
module.exports = router;



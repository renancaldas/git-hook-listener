'use strict';

/* NPM Dependencies
---------------------------------*/
const debug = require('debug')('git-hook-listener:lib:http');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const config = require('config').get("config");
const bodyParser  = require( 'body-parser' );
const Q = require("q");

// Parse "application/json"
app.use( bodyParser.json() );

// Parse "application/x-www-form-urlencoded"
app.use(bodyParser.urlencoded({ extended: false }))

/* Router
---------------------------------*/
app.use('/', require('./api_v1'));

/* Http Server
---------------------------------*/
http.listen(config.serverPort, function() {
  debug("Server started at port %s", config.serverPort);
}); 
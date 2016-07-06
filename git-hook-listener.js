var express = require('express');
var app = express();
var http = require('http').Server(app);
var debug = require('debug')('git-hook-listener.js');
var config = require('config').get("config");
var bodyParser  = require( 'body-parser' );
var shell = require("shelljs");
var fs = require("fs");
var Q = require("q");

var oneDay = 86400000; // Cache data for 1 day
app.use(express.static(__dirname + '/web', { maxAge: oneDay }));

// Parse body in json format
app.use( bodyParser.json() );

// Routes
var router = express.Router();

router.route('/update')
  .post(function(req, res, next) {  
		res.status(200).send('Webhook Received. Please check the monitor for more information.');

  		debug('Updating git-hook-listener from ' + config.bitbucket.source);
		shell.exec('cd ' + config.bitbucket.listenerPath + ' && git reset --hard HEAD && git pull', { silent:true, async:true }, function(code, stdout, stderr){
			if(code == 0) {
				var message = 'Updated successfully!';
				debug(message);
			}
			else {
				debug('Error on updating git-hook-listener: ' + stderr);
			}
		});
  });

router.route('/test')
  .get(function(req, res, next) {  
  		var message = 'Ready to use POST /hook endpoint! \n';
  		debug(message)
  		res.status(200).send(message);
  });

router.route('/hook')
  .post(function(req, res, next) {  
  		var messageWebhook = 'Webhook Received. Please check the monitor for more information.';
  		debug(messageWebhook);
		res.status(200).send(messageWebhook);

  		try {
  			// Promises
	  		// -------------------------------------
	  		function gitClone(repo, localpath) {
	  			var deferred = Q.defer();

	  			// GIT clone (when folder is empty)
				debug('Cloning from ' + repo.url + ' into ' + localpath);
				shell.exec('git clone ' + repo.url + ' ' + localpath, { silent:true, async:true }, function(code, stdout, stderr) {
					if(code == 0) {
						debug('Cloned successfully!');

						// GIT fetch and checkout branch into cloned folder
						shell.exec('cd ' + localpath + ' && git fetch && git checkout ' + repo.branch, { silent:true, async:true }, function(code, stdout, stderr) {
							if(code == 0) {
								var message = repo.branch + ' checked out successfully!';
								debug(message);
								deferred.resolve(message);
							}
							else {
								debug('Error on fetch and checkout: ' + stderr);
								deferred.reject(stderr);
							}
						});
					}
					else {
						debug('Error on cloning repo: ' + stderr);
						deferred.reject(stderr);
					}
				});

				return deferred.promise;
	  		}

	  		function gitPull(repo, localpath) {
	  			var deferred = Q.defer();

	  			debug('pulling from ' + repo.url + ' into ' + localpath);
				shell.exec('cd ' + localpath + ' && git reset --hard HEAD && git pull', { silent:true, async:true }, function(code, stdout, stderr){
					if(code == 0) {
						var message = 'pulled successfully!';
						debug(message);
						deferred.resolve(message);
					}
					else {
						debug('Error on pulling repo: ' + stderr);
						deferred.reject(stderr);
					}
				});

				return deferred.promise;
	  		}

	  		function npmInstall(localpath) {
	  			var deferred = Q.defer();

	  			// Path + branch + node
	  			localpath = localpath + '/' + config.repo.npmInstallPath;

				debug('Installing NPM packages...');
				shell.exec('cd ' + localpath + ' && npm install', { silent:true, async:true }, function(code, stdout, stderr) {
					if(code == 0) {
						var message = 'NPM packages installed!';
						debug(message);
						deferred.resolve(message);
					}
					else {
						debug('Error on installing NPM packages: ' + stderr);
						deferred.reject(stderr);
					}
				});

				return deferred.promise;
	  		}

	  		// Verify if has git installed and start
	  		// --------------------------------------
			if (!shell.which('git')) {
				var message = 'Could not get repository data. Please install git first!';
				debug(message);

			    	// Getting bitbucket's 10s timeout, use monitor instead
		    		// res.status(500).json({ message: message });
			}
			else {
				debug('Git detected! Ready for receiving data from webhook.');

				// Validate received value
				if(req.body.push.changes.length == 1) {
					var changes = req.body.push.changes[0];

					// Parse hook (check if has new changes)
					var repo = {
						localpath: config.repo.destinationPath + '/',
						branch: changes.new ? changes.new.name : changes.old.name,
						name: changes.new ? changes.new.repository.name : changes.old.repository.name
					};
					repo.url = changes.new ? changes.new.links.html.href : changes.old.links.html.href;

					// Verify if has folder created
			    		if (!fs.existsSync(repo.localpath)) {
						    fs.mkdirSync(repo.localpath);
			    			debug('Created folder ' + repo.localpath);
			    		}

		    			// Verify if a folder has been commited
			    		var localpath = repo.localpath + '/' + repo.name + '/' + repo.branch;
			    		debug(localpath);
			    		fs.exists(localpath, function(exists) {
			    			if(!exists) {

			    				// GIT clone (when folder is empty)
			    				gitClone(repo, localpath).then(function(gitCloneMsg){
			    					npmInstall(localpath).then(function(npmInstallMsg){
			    						// Getting bitbucket's 10s timeout, use monitor instead
				    					// res.status(200).json({ message: gitCloneMsg });
			    					}, function(npmInstallErr){
			    						// Getting bitbucket's 10s timeout, use monitor instead
					    				//res.status(500).json({ message: npmInstallErr });
			    					});
			    				}, function(gitCloneErr){
			    					// Getting bitbucket's 10s timeout, use monitor instead
					    			//res.status(500).json({ message: gitCloneErr });
			    				});

			    			}

			    			else {

			    				// GIT pull (just grab latest updates)
			    				gitPull(repo, localpath).then(function(gitPullMsg){
			    					npmInstall(localpath).then(function(npmInstallMsg){
			    						// Getting bitbucket's 10s timeout, use monitor instead
				    					//res.status(200).json({ message: gitPullMsg });
			    					}, function(npmInstallErr){
			    						// Getting bitbucket's 10s timeout, use monitor instead
					    				//res.status(500).json({ message: npmInstallErr });
			    					});
			    				}, function(gitPullErr){
			    					// Getting bitbucket's 10s timeout, use monitor instead
					    			//res.status(500).json({ message: gitPullErr });
			    				});
			    			}
					});
				}
			}
  		}
  		catch(ex) {
  			debug(ex.message);
  			// Getting bitbucket's 10s timeout, use monitor instead
	  		//res.status(500).send(ex.message);
		}
  });


app.use('/', router, function(req, res) {
});

// HTTP server
http.listen(config.serverPort, function() {
  debug("Server started at port %s", config.serverPort);
}); 
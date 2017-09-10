'use strict';

/* NPM Dependencies
---------------------------------*/
const debug = require('debug')('git-hook-listener:lib:api_v1');
const express = require('express');
const shell = require("shelljs");
const fs = require("fs");
const config = require('config').get("config");
const mkdirp = require('mkdirp');
const Q = require('q');

/* Parsers
---------------------------------*/
const githubParser = require('./parsers/github.js');
const bitbucketParser = require('./parsers/bitbucket.js');

/* Local Functions
---------------------------------*/
function gitClone(repo, localpath) {
    var deferred = Q.defer();

    // GIT clone (when folder is empty)
    debug('Cloning from ' + repo.url + ' into ' + localpath);
    var cmd = 'git clone ' + repo.url + ' ' + localpath;
    shell.exec(cmd, { silent:true, async:true }, function(code, stdout, stderr) {
        if(code == 0) {
            debug('Cloned successfully!');

            // GIT fetch and checkout branch into cloned folder
            cmd = 'cd ' + localpath + ' && git fetch && git checkout ' + repo.branch;
            shell.exec(cmd, { silent:true, async:true }, function(code, stdout, stderr) {
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
    var cmd = 'cd ' + localpath + ' && git reset --hard HEAD && git pull'
    shell.exec(cmd, { silent:true, async:true }, function(code, stdout, stderr){
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
    var cmd = 'cd ' + localpath + ' && npm install'
    shell.exec(cmd, { silent:true, async:true }, function(code, stdout, stderr) {
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

function checkFolder(folder) {
    const deferred = Q.defer();

    if (!fs.existsSync(folder)) {
        mkdirp(folder, function (err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                debug('Created folder ' + folder);
                deferred.resolve();
            }
        });
        
    } else {
        debug('Folder exists. Continuing...');
        deferred.resolve();
    }

    return deferred.promise;
}

function parseBody(headers, body) {
    const deferred = Q.defer();

    var repo = null;
    const isGithub = headers['user-agent'].toLowerCase().indexOf('github') !== -1;
    const isBitbucket = headers['user-agent'].toLowerCase().indexOf('bitbucket') !== -1;
    
    if (isGithub) {
        debug('Parsing Github hook');
        deferred.resolve(githubParser(body));
    }
    else if (isBitbucket) {
        debug('Parsing Bitbucket hook');
        deferred.resolve(bitbucketParser(body));
    }
    else {
        deferred.reject('Webhook\'s repository not added in parse yet.');
    }

    return deferred.promise;
}

/* Module
---------------------------------*/
module.exports = {
    update: function() {
        res.status(200).send('Webhook Received. Please check the monitor for more information.');

  		debug('Updating git-hook-listener from ' + config.bitbucket.source);
        var cmd = 'cd ' + config.bitbucket.listenerPath + ' && git reset --hard HEAD && git pull';
		shell.exec(cmd, { silent:true, async:true }, function(code, stdout, stderr){
			if(code == 0) {
				var message = 'Updated successfully!';
				debug(message);
			}
			else {
				debug('Error on updating git-hook-listener: ' + stderr);
			}
		});
    },
    processHook: function(headers, body) {
        try {
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

                // Parse body
                parseBody(headers, body).then(function(repo) {
                    var localpath = config.repo.destinationPath + '/' + repo.name + '/';

                    // Verify if has folder created
                    debug('Checking if exists folder: ' + localpath);
                    checkFolder(localpath).then(function() {
                        
                        // Verify if folder exists (has been cloned)
                        localpath += repo.branch;

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
                    });
                }, function(err){
                    debug(err);
                });
			}
  		}
  		catch(ex) {
            console.error(ex.message);
            // Getting bitbucket's 10s timeout, use monitor instead
            //res.status(500).send(ex.message);
		}
    }
}


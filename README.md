# Git Hook Listener

An application for continuous deployment that listens webhooks and downloads updates 

#### Initial configuration

##### 1) Installation
```sh
  $ cd [path to install]
  $ git clone https://github.com/renancaldas/git-hook-listener.git
  $ npm install
```
##### 2) Edit config file in folder /git-hook-listener/config
```
{
	"config": {
		"serverPort": 3000,
		"bitbucket": {
			"user": "your_user_name",
			"pass": "your_password"
		},
		"repo": {
			"destinationPath": "/path/to/download/",
			"npmInstallPath": "/relative/path/to/executable"
		}
	}
}
```
##### 3) Run (using development config file and debug module)
```sh
   $ NODE_ENV=development DEBUG=git* node git-hook-listener.js
```

##### 4) Test if application is up and running
Make a GET request to the endpoint running in your machine, for example: 
```sh
   $ curl http://localhost:3000/test
```

If appears the message "`Ready to use POST /hook endpoint!`" you are ready to go!

##### 5) Config webhook
Go to [bitbucket](https://bitbucket.org/) / [github](https://github.com), select your repository then go to Settings -> Webhooks and create a request to the application running, ending with the `/hook`. For example: `http://www.your_domain_running_the_app.com:port/hook`. OBS.: If you are running in your local machine using localhost, you should create a proxy for receving external requests from the internet. Ngrok is a good option: https://ngrok.com/ 

Finally, you can push changes to your repository which will trigger the webhook to the application and then make a git clone / pull to the specified folder in the config file.
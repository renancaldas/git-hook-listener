# Git Hook Listener

An application that listens webhook for continuous deployment

#### Initial configuration

##### 1) Installation
```sh
  $ cd [path to install]
  $ git clone https://github.com/renanzeira/git-hook-listener.git
  $ npm install
```
##### 2) Edit config file in folder /git-hook-listener/config/development.json
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

##### 4) Testing if application is running
Make a GET request to the endpoint running in your machine, for example: 
```sh
   $ curl http://localhost:3000/test
```

If appears the message "`Ready to use POST /hook endpoint!`" you are ready to go!

##### 5) Config webhook
Go to https://bitbucket.org/, select your repository then go to Settings -> Webhooks and create a request to the application running, ending with the `/hook`. For example: `http://www.your_domain_running_the_app.com:port/hook`. OBS.: If you are running in localhost, you should create a proxy for receving external requests. Ngrok is a good option: https://ngrok.com/ 

Finally, you can push changes to your repository and then the application will make a git clone to the folder specified in the config file.
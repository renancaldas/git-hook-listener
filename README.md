# Git Hook Listener

An application for continuous deployment that listens for git webhooks and downloads push updates automatically.

Feel free to check out my [step-by-step guide to configure an AWS EC2 server](https://github.com/renancaldas/aws-ec2-guide) too.

&nbsp;

### Summary
---
1. "Why should I use this"?
2. Prerequisites
3. Getting started
4. Author

&nbsp;

### 1. "Why should I use this"?
---
In order to replicate the latest code in your repo to your servers, just using git commit.

Short story: I used to update applications on servers by dragging and dropping files via Filezilla, manually. Sometimes I had to check the files to replace from my computer to the server. And I used to do this process a lot of times, specially to show and validate new functionalities in development. It takes a lot of time and effort just to do a simple task: get my newest updates in my machine and update on the server. But now, using a git repository and this project, I just commit my changes and, BAM! The files are replicated to the server as well! 😃  

&nbsp;

### 2. "Ok, what are the prerequisites?"
---
- Git repository (github, bitbucket...)
- NodeJS installed in your server / computer. 


&nbsp;

### 3. Getting started
##### 1. Store your Git repository user credentials in your machine (for Linux)
---
This is for avoiding prompting your user and password when doing a git pull. Windows users, please give me a feedback.

```
  // In terminal, write:
  $ nano ~/.netrc
  
  // And add these lines:
  machine github.com (or bitbucket.org)
  login [YOUR_USER]
  password [YOUR_PASS]
  
  // Save it using: CMD + o
  // And exit using: CMD + x
```

&nbsp;

##### 2. Download this project
---
```
  $ cd [path to download]
  $ git clone https://github.com/renancaldas/git-hook-listener.git
  $ cd git-hook-listener && npm install
```

&nbsp;

##### 3. Running for the first time
---
You should have [nodemon](https://github.com/remy/nodemon) installed! If you don't, please do: `npm install -g nodemon`
```
   $ npm start
   // Which runs: NODE_ENV=development DEBUG=git* nodemon git-hook-listener.js
```
It should appear the message: `git-hook-listener.js Server started at port 3000 +0ms`

&nbsp;

##### 4. Test if application is up and running
---
Make a GET request to the endpoint running, for example: 
```
    // Open a new CMD, because the current window is running the application
    $ curl http://localhost:3000/test

    // Or try connecting remotelly
    $ curl http://www.your_domain_running_the_app.com:3000/test
```

If appears the message "`Ready to use POST /hook endpoint!`" you are good to go!

&nbsp;

##### 5. Configuring webhook
---
Go to your Git repo (like [bitbucket](https://bitbucket.org/)), select your repository then go to **Settings** -> **Webhooks** and create a request to the application, ending with the `/hook`. For example: `http://www.your_domain_running_the_app.com:port/hook`. 

**Obs**: If you are running in your local machine using **localhost**, you should create a proxy for receving external requests from the internet. In this case, I recommend **Ngrok** for testing: https://ngrok.com/.

&nbsp;

##### 6. It is done!
---
Finally, you can push changes to your repository. It will trigger the webhook to the application and do a git clone / pull to your server in the specified folder in the config file, automatically! 

**Obs:** I recommend [PM2 (Process Manager 2)](https://github.com/Unitech/pm2) to set this application to run "forever" (like [npm forever](https://www.npmjs.com/package/forever)) even after a crash or server restart.

&nbsp;

&nbsp;


### 4. Author
---
Renan Caldas de Oliveira

- Web: http://www.renancaldas.com

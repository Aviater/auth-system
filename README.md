NodeJs Elective - Mandatory 2
===============================

This auth app satisfies all the requirements stated in the Mandatory assignment nº2 including the bonus.

Some info:
- The authentication takes place using json web tokens and saving them to the express-session object.
- The pages 'landing' and 'about' are both on protected routes and need to pass token verification before rendering.
- The logout function clears the session object and redirects to the login page.

Set up:
1) npm install
2) Run database
3) Create config.json in the config directory and apply config.template.json template with your own databse name, user and password.
4) Create mysqlCredentails.js in the config directory and apply mysqlCredentials.template.js template with your own 
'token-secret' and 'session-secret' string values.
5) Create .env file in root directory and apply .env.template with nodemailer credentials.
6) Run server with 'node app.js'
7) In new terminal execute 'npm run createdb' script.
8) App will be running on localhost:3000/login.

Password reset:
Following the link underneath the password input on the sign in page will promt you for an email address which, 
if present in the database, will send to that email address a new password and update the database cell data.

Note:
Because of the nature of the password reset functionality I've changed the username to only accept email addresses since 
this is where Nodemailer will send the reset email to and therefore skip having to create a new column in the database to 
differentiate usernames from emails since, for the purpose of this app, there's no need for a separate username.

-----------------------------------------------------------
Git repository: https://github.com/Aviater/auth-system.git
-----------------------------------------------------------

	- Benedict Marien, Node b.
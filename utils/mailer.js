const nodemailer = require('nodemailer');

sendMail = (username, password) => {
    // Email Styling
    const htmlEmail = `
    <h3>Password Reset</h3>
    <p>Hi ${username}, your new password is ${password}.</p>
    `

    // Mail Authentication
    var transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take messages');
        }
    });

    var mail = {
        from: process.env.EMAIL,
        to: username,
        subject: 'Your new password',
        html: htmlEmail
    }

    transporter.sendMail(mail, (err, data) => {
        if (err) {
            return console.log(err);
        } else {
            console.log('Message sent!');
        }
    });
}

exports.sendMail = sendMail;
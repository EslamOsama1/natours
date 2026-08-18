
const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');

const welcomeTemplate = require('./emailTemplates/welcome');
const passwordResetTemplate = require('./emailTemplates/passwordReset');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Eslam Schemedtmann <${process.env.EMAIL_FROM}>`;
    }


    newTransport() {

        if (process.env.NODE_ENV === 'production') {
            //use sandGrid here
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(subject, html) {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html)
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        const html = welcomeTemplate(this.firstName, this.url);

        await this.send(
            'Welcome to Natours Family!',
            html
        );
    }

    async sendPasswordReset() {
        const html = passwordResetTemplate(this.firstName, this.url);

        await this.send(
            'Your password reset token (valid for only 10 minutes)',
            html
        );
    }
};
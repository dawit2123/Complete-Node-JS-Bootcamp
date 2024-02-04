const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
//email sender class
module.exports = class email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Dawit Zewdu ${process.env.SENDER_EMAIL}`;
  }
  createaTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid code here
      return 1;
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }
  async send(template, subject) {
    //render the html code
    const html = pug.renderFile(
      `${__dirname}/../../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        subject,
        url: this.url
      }
    );
    //define the email options
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: this.subject,
      html,
      text: htmlToText.fromString(html)
    };
    //create transport and send mail
    await this.createaTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours application');
  }
};

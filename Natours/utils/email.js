const nodemailer = require('nodemailer');

const sendMail = async options => {
  //1) creating a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 25,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //2) creating a mail option
  const mailOptions = {
    from: 'Dawit Zewdu <dawitmunie111@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text
    // html
  };
  //3) sending the email using transporter
  info = await transporter.sendMail(mailOptions);
  console.log(info);
  return info;
};

module.exports = sendMail;

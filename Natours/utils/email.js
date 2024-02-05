const nodemailer = require('nodemailer');
const sendMail = async options => {
  //1) creating a transporter
  const transporter = nodemailer.createTransport({
    //for services that are not registered in nodemon
    //we should specify the host and port  like host: process.env.host
    //and the port like port: process.env.port
    service: 'Google',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //2) creating a mail option
  const mailOptions = {
    from: 'Dawit Zewdu <dawitzewdu2123@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.message
    // html
  };
  //3) sending the email using transporter
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;

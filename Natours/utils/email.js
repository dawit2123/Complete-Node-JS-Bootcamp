const nodemailer = require('nodemailer');
const sendMail = async options => {
  //1) creating a transporter
  const transporter = nodemailer.createTransport({
    //for services that are not registered in nodemon
    //we should specify the host and port  like host: process.env.host
    //and the port like port: process.env.port
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'd181c41641c224',
      pass: 'd3d0f3adce5450'
    }
  });
  //2) creating a mail option
  const mailOptions = {
    from: 'Dawit Zewdu <dawitmunie111@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.message
    // html
  };
  //3) sending the email using transporter
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;

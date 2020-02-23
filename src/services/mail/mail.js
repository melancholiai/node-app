const nodemailer = require('nodemailer');

const { SMTP_OPTIONS, MAIL_FROM } = require('../../config/mail-config');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(SMTP_OPTIONS);

// send mail with defined transport object
module.exports.sendMail = async template =>
  new Promise((resolve, reject) => {
    const options = {
      ...template,
      from: MAIL_FROM
    };

    transporter.sendMail(options, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });

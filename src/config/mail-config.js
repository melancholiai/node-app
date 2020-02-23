const { IN_PROD } = require('./main-config');

const {
  APP_NAME,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD
} = process.env;

module.exports.SMTP_OPTIONS = {
  host: SMTP_HOST,
  port: +SMTP_PORT,
  //FIXME: secure should be IN_PROD
  secure: false,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD
  },
  tls: {
        rejectUnauthorized: false
    }
};

module.exports.MAIL_FROM = `noreply@${APP_NAME}.com`;

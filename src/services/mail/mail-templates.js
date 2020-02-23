const { APP_NAME } = require('../../config/main-config')

exports.verificationMail = (recepient, link) => {
  return {
    to: recepient,
    subject: 'Verify your email address',
    html: `<b>Welcome to ${APP_NAME}!</b>
    <br> Please click on the link below to activate your account and complete your signup process.<br />
    <a href=${link}>ACTIVATE ACCOUNT</a>
    <br>
    <img src="https://dearcanine.com/wp-content/uploads/2019/05/happy-ending-i-1-700x420.jpg" alt="chatapp" />`
  };
};


exports.resetPasswordMail = (recepient, link) => {
  return {
    to: recepient,
    subject: `${APP_NAME} Password Reset Request`,
    html: `<b>Forgot your password?</b>
    <br> Please click on the link below to reset your password.<br />
    <a href=${link}>RESET PASSWORD</a>`
  };
};

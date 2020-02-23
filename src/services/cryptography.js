const { createHash, createHmac, timingSafeEqual, randomBytes } = require('crypto');

const { APP_URL, APP_SECRET } = require('../config/main-config');

const hashPassword = plainTextPassword => 
  createHash('sha256')
    .update(plainTextPassword)
    .digest('base64');

const buildUrl = (urlQueryParams) => {
  const url = `${APP_URL}/auth/${urlQueryParams.type}?` + urlQueryParams.getStringUrl();
  return `${url}&signature=${signSecret(url)}`;
};

const ValidateUrl = (path, query) => {
  const url = `${APP_URL}${path}`;
  const original = url.slice(0, url.lastIndexOf('&'));
  const signature = signSecret(original);
  let isExpired = false;
  if (query.expires) {
    expires = +query.expires > Date.now()
  }
  return (
    timingSafeEqual(Buffer.from(signature), Buffer.from(query.signature)) && !isExpired
  );
};

const generateToken = (data) => createHash('sha1')
    .update(data)
    .digest('hex');

const generatePlainTextToken = numOfBytes => randomBytes(+numOfBytes).toString('hex');

const signSecret = url =>
  createHmac('sha256', APP_SECRET)
    .update(url)
    .digest('hex');

module.exports.hashPassword = hashPassword;
module.exports.generateToken = generateToken;
module.exports.generatePlainTextToken = generatePlainTextToken
module.exports.buildUrl = buildUrl;
module.exports.ValidateUrl = ValidateUrl;

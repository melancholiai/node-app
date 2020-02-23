module.exports.CustomHttpError = class CustomHttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};

module.exports.BadRequest = class BadRequest extends Error {
  constructor(message = 'Bad Request') {
    super(message);

    this.status = 400;
  }
};

module.exports.Unauthorized = class Unauthorized extends Error {
  constructor(message = 'Unauthorized') {
    super(message);

    this.status = 401;
  }
};

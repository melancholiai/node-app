module.exports.catchAsync = handler => (...args) =>
  handler(...args).catch(args[2]);

module.exports.notFound = (req, res, next) =>
  res.status(404).json({ message: 'Page Not Found.' });

module.exports.serverError = (err, req, res, next) => {
  if (!err.status) {
    console.error(err.stack);
  };
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal Server Error' });
};

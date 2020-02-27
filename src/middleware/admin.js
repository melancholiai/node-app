const objectPath = require("object-path");

const { Unauthorized, NotFound } = require('../errors');

module.exports.isAdmin = (model, modelIdPath) => {
  return async (req, res, next) => {
    // using reflection get the model id out of the request
    const id = objectPath.get(req, modelIdPath);
    if (!id) {
      return next(new NotFound()); 
    }
    const document = await model.findById(req.params.socialcircleId);
    if (!document) {
      return next(new NotFound());
    }
    if (document.admin._id != req.session.userId) {
      return next(new Unauthorized('Only admin can enter this endpoint.'));
    }
    next();
  };
};

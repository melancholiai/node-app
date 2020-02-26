const { Unauthorized, NotFound } = require('../errors');

// FIXME: sould have async
module.exports.isAdmin = (model, modelId) => {
    console.log(modelId);
    
//   const document = await model.findById(modelId);
//   if (!document) {
//     return next(new NotFound());
//   }
//   if (document.admin != req.session.userId) {
//     return next(new Unauthorized('Only admin can enter this endpoint.'));
//   }
  next();
};

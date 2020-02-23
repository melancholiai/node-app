const { SchemaDirectiveVisitor } = require('apollo-server-express');
const { defaultFieldResolver } = require('graphql');

const { checkSignedIn } = require('../../util/auth-garaphql');

class GuestDirective extends SchemaDirectiveVisitor {
  // the field in which the directive is applyed to (e.g. the basic info query)
  visitFieldDefinition(field) {
    // can fall back into the default resolver
    const { resolve = defaultFieldResolver } = field;
    // override the resolve function
    field.resolve = function(...args) {
      // grab the context with destructoring
      const [, , context] = args;

      // do logic
      checkSignedIn(context.req);

      // using traditional function will keep the 'this' keyword scope to the field 
      return resolve.apply(this, args);
    };
  }
}

module.exports = GuestDirective;
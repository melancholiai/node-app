// the basic super scheme of every typeDef

const { gql } = require('apollo-server-express');

module.exports = gql`
  # define directives
  directive @auth on FIELD_DEFINITION
  directive @guest on FIELD_DEFINITION

  type Query {
    _: String
  }

  type Mutation {
    _: String
  }

  type Subscription {
    _: String
  }
`;

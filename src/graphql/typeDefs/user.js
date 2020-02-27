const { gql } = require("apollo-server-express");

module.exports = gql`
  extend type Query {
    user(id: ID!): AuthUser @auth
    users: [AuthUser!]! @auth
    basicInfo: AuthUser @auth
  }

  extend type Mutation {
      signUp(email: String!, password: String!, passwordConfirmation: String! username: String!, name: String!): AuthUser @guest
      login(email: String!, password: String!): AuthUser @guest
      signOut: Boolean @auth
  }

  type AuthUser {
    id: ID!
    email: String!
    username: String!
    name: String!
    chats: [Chat!]!
    createdAt: String
    updatedAt: String
  }
`;
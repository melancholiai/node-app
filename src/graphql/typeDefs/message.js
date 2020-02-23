const { gql } = require("apollo-server-express");

module.exports = gql`
  type Message {
    id: ID!
    sender: AuthUser!
    body: String!
    chat: Chat!
    createdAt: String
    updatedAt: String
  }
`;
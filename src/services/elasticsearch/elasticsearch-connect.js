const { Client } = require('@elastic/elasticsearch')

const { ELASTICSEARCH_OPTIONS } = require('../../config/elasticsearch-config');

const client = new Client({ node: `http://${ELASTICSEARCH_OPTIONS.hostname}:${ELASTICSEARCH_OPTIONS.port}` })

module.exports = client;  

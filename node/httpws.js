// see license file in project


'use strict';


const client   = require('./client');
const common   = require('./common');
const incoming = require('./incoming');
const outgoing = require('./outgoing');
const server   = require('./server');
const agent    = require('./agent');

const Server = server.Server;
const ClientRequest = client.ClientRequest;



function createServer(requestListener) {
  return new Server(requestListener);
}

function request(options, cb) {
  return new ClientRequest(options, cb);
}

function get(options, cb) {
  var req = request(options, cb);
  req.end();
  return req;
}

module.exports = {
  _connectionListener: server._connectionListener,
  STATUS_CODES: server.STATUS_CODES,
  Agent: agent.Agent,
  ClientRequest,
  IncomingMessage: incoming.IncomingMessage,
  OutgoingMessage: outgoing.OutgoingMessage,
  Server,
  ServerResponse: server.ServerResponse,
  createServer,
  get,
  request
};

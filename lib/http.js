// see license file in project


'use strict';


const client = require('./_http_client');
const common = require('./_http_common');
const incoming = require('./_http_incoming');
const outgoing = require('./_http_outgoing');
const server = require('./_http_server');

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
  //METHODS: common.methods.slice().sort(),
  STATUS_CODES: server.STATUS_CODES,
  //Agent: agent.Agent,
  ClientRequest,
  IncomingMessage: incoming.IncomingMessage,
  OutgoingMessage: outgoing.OutgoingMessage,
  Server,
  ServerResponse: server.ServerResponse,
  createServer,
  get,
  request
};

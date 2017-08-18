'use strict';

const net = require('net');
const util = require('util');
const EventEmitter = require('events');
const common = require('./common');
const debug = common.debug;

var _request_counter=1;
function Agent() {
  if (!(this instanceof Agent))
    return new Agent();

  EventEmitter.call(this);

  var self = this;

  self.defaultPort = 80;
  self.protocol = 'http:';

  self.requests = {};
  self.connections = {};

  self.on('free', function(socket) {
    var name = self.getName(options);
    debug('agent.on(free)', socket);
  });
}

util.inherits(Agent, EventEmitter);

Agent.prototype.addConnection = function addConnection(name,socket, server){
  if( this.connections[name]){
    return false;
  }
  this.connections[name]={
    name,
    socket,
    server,
    requests:{}
  };
  return true;
}


Agent.prototype.addRequest = function addRequest(req) {
  // Legacy API: addRequest(req, host, port, localAddress)
  //if (typeof options === 'string') {
  //  options = {
  //    host: options
  //  };
  //}

  var host = req.getHeader('host')
  if( !host ){
    throw new Error('NOHOST_IN_REQUEST');
  }
  var connection = this.connections[host];
  if( !connection ){
    throw new Error('REQUEST_TO_NOT_ESTABLISHED_CONNECT');    
  }

  var id = ++_request_counter ? _request_counter : _request_counter=1;
  req.setHeader('CSeq',id);
  req.socket = connection.socket;
  connection.requests[id]=req;
};

module.exports = {
  Agent,
  globalAgent: new Agent()
};

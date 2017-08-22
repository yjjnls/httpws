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

//  self.requests = {};
  self.connections = [];

  self.on('free', function(socket) {
    var name = self.getName(options);
    debug('agent.on(free)', socket);
  });
}

util.inherits(Agent, EventEmitter);

Agent.prototype.addConnection = function addConnection(name,socket, server){

  if(this.getConnection(name) != null){
    return false;
  }

  this.connections.push({
    name,
    socket,
    server,
    requests:{}
  });
  return true;
}

Agent.prototype.removeConnection = function removeConnection(socket){
  for(var i=0; i < this.connections.length; i++){
    if( this.connections[i].socket==socket){
      this.connections.splice(i,1);
      return;
    }
  }
}

Agent.prototype.getConnection = function getConnection(name) {
  for(var i=0; i < this.connections.length; i++){
    if( this.connections[i].name === name ){
      return this.connections[i];
    }
  }
  return null;
};

Agent.prototype.addRequest = function addRequest(request) {
  var req = request.request;
  var cb = req.callback;

  var host = req.getHeader('host')
  if( !host ){
    throw new Error('NOHOST_IN_REQUEST');
  }
  var connection = this.getConnection(host);
  if( !connection ){
    throw new Error('REQUEST_TO_NOT_ESTABLISHED_CONNECT');
  }

  var id = ++_request_counter ? _request_counter : _request_counter=1;
  req.setHeader('CSeq',id);
  req.socket = connection.socket;
  connection.requests[id]=request;
};

Agent.prototype.getConnectionByReqId = function getConnectionByReqId(id) {
  for(var i=0; i < this.connections.length; i++){
    if( this.connections[i].requests[id]){
      return this.connections[i];
    }
  }
  return null;
}
Agent.prototype.getConnectionBySocket = function getConnectionBySocket(socket) {
  for(var i=0; i < this.connections.length; i++){
    if( this.connections[i].socket==socket){
      return this.connections[i];
    }
  }
  return null;
}
module.exports = {
  Agent,
  globalAgent: new Agent()
};

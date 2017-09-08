// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

const util = require('ws');
const events = require('events');
const http = require('http');
const CRLF = http.CRLF;
const common = require('./common');
const processIncomingMessage = common.processIncomingMessage;
const parsers = require('_http_common').parsers;
const _connectionListener=http._connectionListener;

class Server extends events.EventEmitter {

 
  constructor(requestListener ){

    if (requestListener) {
      this.on('request', requestListener);
    }
  
    // Similar option to this. Too lazy to write my own docs.
    // http://www.squid-cache.org/Doc/config/half_closed_clients/
    // http://wiki.squid-cache.org/SquidFaq/InnerWorkings#What_is_a_half-closed_filedescriptor.3F
    this.httpAllowHalfOpen = false;
  
    this.on('connection', _connectionListener);
  
    this.timeout = 2 * 60 * 1000;
    this.keepAliveTimeout = 5000;
    this._pendingResponseData = 0;
    this.maxHeadersCount = null;
    this.listen = this.listen.bind(this);




    return;
    if (requestListener) {
      this.on('request', requestListener);
    }
    this._count=0
    this._wss = null;
    this._clients= new Map();
    this._onIncomingRequest = onIncomingRequest.bind(this);
    this._onIncomingResponse = onIncomingResponse.bind(this);
    this.on('incoming-request',this._onIncomingRequest);
    this.on('incoming-response',this._onIncomingResponse);

  }



  listen(options){

  
    var self = this;
    this._wss = new ws.Server(options);
  
    this._wss.on('connection', function( ws, request  ){

      var name = self.login( request.url );
      if( typeof name === 'string'){
        this._clients[ws]={ name, socket : new Socket(ws) }
        this.emit('connection',socket);
      } else {
        ws.send(':message 0' + CRLF
               +'Content-Type:application/json' + CRLF 
               +CRLF
               +JSON.stringify(name) );
        ws.close();
        return;
      }
  
      ws.on('message',function(data,flags){
        m = common.parse(data);
        if( !m ){
          return;
        }
        if( m.type === 'request'){
          client = this._clients[ws];
          client.socket.emit('data', m.httpMessage);
        }

      });
  
      ws.on('close',function(){
        self.emit('close',ws);
      });
    });  
  };
}

function _OnConnect( self, ws ){
  var parser = parsers.alloc();
  parser.reinitialize(HTTPParser.REQUEST);
  parser.socket = socket;
  socket.parser = parser;
  parser.incoming = null;

  // Propagate headers limit from server instance to parser
  if (typeof this.maxHeadersCount === 'number') {
    parser.maxHeaderPairs = this.maxHeadersCount << 1;
  } else {
    // Set default value because parser may be reused from FreeList
    parser.maxHeaderPairs = 2000;
  }

  var state = {
    onData: null,
    onEnd: null,
    onClose: null,
    onDrain: null,
    outgoing: [],
    incoming: [],
    // `outgoingData` is an approximate amount of bytes queued through all
    // inactive responses. If more data than the high watermark is queued - we
    // need to pause TCP socket/HTTP parser, and wait until the data will be
    // sent to the client.
    outgoingData: 0,
    keepAliveTimeoutSet: false
  };
  state.onData = socketOnData.bind(undefined, this, socket, parser, state);
  state.onEnd = socketOnEnd.bind(undefined, this, socket, parser, state);
  state.onClose = socketOnClose.bind(undefined, socket, state);
  state.onDrain = socketOnDrain.bind(undefined, socket, state);
  socket.on('data', state.onData);
  socket.on('error', socketOnError);
  socket.on('end', state.onEnd);
  socket.on('close', state.onClose);
  socket.on('drain', state.onDrain);
  parser.onIncoming = parserOnIncoming.bind(undefined, this, socket, state);


}
function onIncomingRequest(m,ws){
  //check for if is chunk one

  var client = this._clients[ws];
  var request = client ? client[m.SN]:undefined;
  if( !request ){
    request=new http.IncomingMessage( null );

    request.push(m.httpMessage);

  } else {

  }

  if( request ){
    if( m.ChunkSN ){
      
    }
  }
  var httpMessage=m.httpMessage;
  if( !m.ChunkSN ){

  } 
}
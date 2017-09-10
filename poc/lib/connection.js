'use strict';

const binding = require('./http_parser');
const methods = binding.methods;
const HTTPParser = binding.HTTPParser;

const EventEmitter = require('events').EventEmitter;
const assert = require('assert').ok;
const common = require('./_http_common');
const parsers = common.parsers;
const freeParser = common.freeParser;
const debug = common.debug;
const continueExpression = common.continueExpression;
const chunkExpression = common.chunkExpression;
const httpSocketSetup = common.httpSocketSetup;

const kOnHeaders = HTTPParser.kOnHeaders | 0;
const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0;
const kOnBody = HTTPParser.kOnBody | 0;
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0;
const kOnExecute = HTTPParser.kOnExecute | 0;

class Connection extends EventEmitter {

    constructor( socket , app ){
        super();
        var self = this;
        this.on('chunk', (chunk) =>{
            var m=_parse( chunk );
            if( m ){
                self['on_'+m.type](m.data,m.id,m.last);
            }
        });

        this.socket=socket;
        this.app =app;        
        this.requests={};//service recive request

    }

    on_request( data, id, last){
        var request = this.requests[id];
        if( !request ){
            var parser = parsers.alloc();
            parser.reinitialize(HTTPParser.REQUEST);
            parser.socket = this.socket;
            parser.incoming = null;
            parser.Id = id;
            parser.connection=this;
            this.requests[id]=parser;
            parser.onIncoming = parserOnIncoming.bind(undefined, this.app, this.socket, null);
            parser[kOnExecute] =
             onParserExecute.bind(undefined, this, this.socket, parser, null);

        }
        var ret = parser.execute(data);
    }
}


function _parse(chunk) {
    const _CONLON = 0x3A; // :
    const _CR     = 0x0D; //\r
    const _LF     = 0x0A;//\n
    
    if ( !chunk || chunk[0] !== _CONLON) {
        debug('Invalide message');
        return;
    }
    
    var n = chunk.indexOf( _CR, 1);
    if (n === -1)
      return;
    var line = chunk.toString('ascii',1,n);

    var pattern = /(request|response|message)\s+([0-9]+)\s*(continue)?/;
    var arr = pattern.exec(line)
    if (arr === null) {
      debug( 'Invalid command line:', line);
      return;
    }
    var type = arr[1];
    var id   = Number(arr[2]);
    var last = arr[3] === undefined ? true : false;
    var data = chunk.slice(n + 2)
    return {type,id,last,data};
}

// base on github.com/node.js/node/lib/_http_server.js
// The following callback is issued after the headers have been read on a
// new message. In this callback we setup the response object and pass it
// to the user.
function parserOnIncoming(app, socket, state, req, keepAlive) {
  //resetSocketTimeout(server, socket, state);
/*
  state.incoming.push(req);

  // If the writable end isn't consuming, then stop reading
  // so that we don't become overwhelmed by a flood of
  // pipelined requests that may never be resolved.
  if (!socket._paused) {
    var ws = socket._writableState;
    if (ws.needDrain || state.outgoingData >= ws.highWaterMark) {
      socket._paused = true;
      // We also need to pause the parser, but don't do that until after
      // the call to execute, because we may still be processing the last
      // chunk.
      socket.pause();
    }
  }
*/
  var res = null;//new ServerResponse(req);
//  res._onPendingData = updateOutgoingData.bind(undefined, socket, state);//

//  res.shouldKeepAlive = keepAlive;
//  DTRACE_HTTP_SERVER_REQUEST(req, socket);
//  LTTNG_HTTP_SERVER_REQUEST(req, socket);
//  COUNTER_HTTP_SERVER_REQUEST();

//  if (socket._httpMessage) {
//    // There are already pending outgoing res, append.
//    state.outgoing.push(res);
//  } else {
//    res.assignSocket(socket);
//  }

  // When we're finished writing the response, check if this is the last
  // response, if so destroy the socket.
//  res.on('finish',
//         resOnFinish.bind(undefined, req, res, socket, state, server));

  if (req.headers.expect !== undefined &&
      (req.httpVersionMajor === 1 && req.httpVersionMinor === 1)) {
    if (continueExpression.test(req.headers.expect)) {
      res._expect_continue = true;

      if (app.listenerCount('checkContinue') > 0) {
        app.emit('checkContinue', req, res);
      } else {
        res.writeContinue();
        app.emit('request', req, res);
      }
    } else {
      if (app.listenerCount('checkExpectation') > 0) {
        app.emit('checkExpectation', req, res);
      } else {
        res.writeHead(417);
        res.end();
      }
    }
  } else {    
    app.emit('request', req, res);
  }
  return false; // Not a HEAD response. (Not even a response!)
}


function onParserExecute(server, socket, parser, state, ret, d) {
 // socket._unrefTimer();
 // debug('SERVER socketOnParserExecute %d', ret);
 // onParserExecuteCommon(server, socket, parser, state, ret, undefined);
}


module.exports ={
    Connection
}
// node/lib/_http_server

'use strict';

const util = require('util');

const HTTPParser = process.binding('http_parser').HTTPParser;
const assert = require('assert').ok;
const common = require('./http_common');
const parsers = common.parsers;
const freeParser = common.freeParser;
const debug = common.debug;
const CRLF = common.CRLF;
const continueExpression = common.continueExpression;
const chunkExpression = common.chunkExpression;
const httpSocketSetup = common.httpSocketSetup;
const OutgoingMessage = require('_http_outgoing').OutgoingMessage;
const outHeadersKey = 0;//{ outHeadersKey, ondrain } = require('internal/http');
//const errors = require('./errors');

const kOnExecute = HTTPParser.kOnExecute | 0;



function ServerResponse(req) {
  OutgoingMessage.call(this);

  if (req.method === 'HEAD') this._hasBody = false;

  this.sendDate = true;
  this._sent100 = false;
  this._expect_continue = false;

  if (req.httpVersionMajor < 1 || req.httpVersionMinor < 1) {
    this.useChunkedEncodingByDefault = chunkExpression.test(req.headers.te);
    this.shouldKeepAlive = false;
  }
}
util.inherits(ServerResponse, OutgoingMessage);

ServerResponse.prototype._finish = function _finish() {
  DTRACE_HTTP_SERVER_RESPONSE(this.connection);
  LTTNG_HTTP_SERVER_RESPONSE(this.connection);
  COUNTER_HTTP_SERVER_RESPONSE();
  OutgoingMessage.prototype._finish.call(this);
};


ServerResponse.prototype.statusCode = 200;
ServerResponse.prototype.statusMessage = undefined;

function onServerResponseClose() {
  // EventEmitter.emit makes a copy of the 'close' listeners array before
  // calling the listeners. detachSocket() unregisters onServerResponseClose
  // but if detachSocket() is called, directly or indirectly, by a 'close'
  // listener, onServerResponseClose is still in that copy of the listeners
  // array. That is, in the example below, b still gets called even though
  // it's been removed by a:
  //
  //   var EventEmitter = require('events');
  //   var obj = new EventEmitter();
  //   obj.on('event', a);
  //   obj.on('event', b);
  //   function a() { obj.removeListener('event', b) }
  //   function b() { throw "BAM!" }
  //   obj.emit('event');  // throws
  //
  // Ergo, we need to deal with stale 'close' events and handle the case
  // where the ServerResponse object has already been deconstructed.
  // Fortunately, that requires only a single if check. :-)
  if (this._httpMessage) this._httpMessage.emit('close');
}

ServerResponse.prototype.assignSocket = function assignSocket(socket) {
  //assert(!socket._httpMessage);
  //socket._httpMessage = this;
  //socket.on('close', onServerResponseClose);
  this.socket = socket;
  this.connection = socket;
  //this.emit('socket', socket);
  //this._flush();
};

ServerResponse.prototype.detachSocket = function detachSocket(socket) {
  //assert(socket._httpMessage === this);
  //socket.removeListener('close', onServerResponseClose);
  //socket._httpMessage = null;
  this.socket = this.connection = null;
};

ServerResponse.prototype.writeContinue = function writeContinue(cb) {
  this._writeRaw('HTTP/1.1 100 Continue' + CRLF + CRLF, 'ascii', cb);
  this._sent100 = true;
};

ServerResponse.prototype._implicitHeader = function _implicitHeader() {
  this.writeHead(this.statusCode);
};

ServerResponse.prototype.writeHead = writeHead;
function writeHead(statusCode, reason, obj) {
  var originalStatusCode = statusCode;

  statusCode |= 0;
  if (statusCode < 100 || statusCode > 999) {
    throw new Error('ERR_HTTP_INVALID_STATUS_CODE');
  }


  if (typeof reason === 'string') {
    // writeHead(statusCode, reasonPhrase[, headers])
    this.statusMessage = reason;
  } else {
    // writeHead(statusCode[, headers])
    if (!this.statusMessage)
      this.statusMessage = STATUS_CODES[statusCode] || 'unknown';
    obj = reason;
  }
  this.statusCode = statusCode;

  var headers;
  if (this[outHeadersKey]) {
    // Slow-case: when progressive API and header fields are passed.
    var k;
    if (obj) {
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        k = keys[i];
        if (k) this.setHeader(k, obj[k]);
      }
    }
    if (k === undefined && this._header) {
      throw new errors.Error('ERR_HTTP_HEADERS_SENT', 'render');
    }
    // only progressive api is used
    headers = this[outHeadersKey];
  } else {
    // only writeHead() called
    headers = obj;
  }

  if (common._checkInvalidHeaderChar(this.statusMessage))
    throw new errors.Error('ERR_INVALID_CHAR', 'statusMessage');

  var statusLine = 'HTTP/1.1 ' + statusCode + ' ' + this.statusMessage + CRLF;

  if (statusCode === 204 || statusCode === 304 ||
      (statusCode >= 100 && statusCode <= 199)) {
    // RFC 2616, 10.2.5:
    // The 204 response MUST NOT include a message-body, and thus is always
    // terminated by the first empty line after the header fields.
    // RFC 2616, 10.3.5:
    // The 304 response MUST NOT contain a message-body, and thus is always
    // terminated by the first empty line after the header fields.
    // RFC 2616, 10.1 Informational 1xx:
    // This class of status code indicates a provisional response,
    // consisting only of the Status-Line and optional headers, and is
    // terminated by an empty line.
    this._hasBody = false;
  }

  // don't keep alive connections where the client expects 100 Continue
  // but we sent a final status; they may put extra bytes on the wire.
  if (this._expect_continue && !this._sent100) {
    this.shouldKeepAlive = false;
  }

  this._storeHeader(statusLine, headers);
}

// Docs-only deprecated: DEP0063
ServerResponse.prototype.writeHeader = ServerResponse.prototype.writeHead;














function Parser( socket, id){
    // Ensure that the server property of the socket is correctly set.
    // See https://github.com/nodejs/node/issues/13435
    if (socket.server === null)
      socket.server = this;

    var parser = parsers.alloc();
    parser.reinitialize(HTTPParser.REQUEST);
    parser.socket = socket;
    parser.incoming = null;
    parser.Id = id;
    parser.push = function ( data ){
      var ret = parser.execute(data);
    }//_push.bind(this);

    //// Propagate headers limit from server instance to parser
    //if (typeof this.maxHeadersCount === 'number') {
    //  parser.maxHeaderPairs = this.maxHeadersCount << 1;
    //} else {
    //  // Set default value because parser may be reused from FreeList
      parser.maxHeaderPairs = 2000;
    //}

    var state = null;
    parser.onIncoming = parserOnIncoming.bind(undefined, this, socket, state);

    parser[kOnExecute] =
      onParserExecute.bind(undefined, this, socket, parser, state);
    return parser;

}

function _push( data ){
    var ret = this.parser.execute(data);
    console.log('ret=',ret);
    //onParserExecuteCommon(server, socket, parser, state, ret, d);
}



function onParserExecute(server, socket, parser, state, ret, d) {
  socket._unrefTimer();
  debug('SERVER socketOnParserExecute %d', ret);
  onParserExecuteCommon(server, socket, parser, state, ret, undefined);
}

function socketOnError(e) {
  // Ignore further errors
  this.removeListener('error', socketOnError);
  this.on('error', () => {});

  if (!this.server.emit('clientError', e, this))
    this.destroy(e);
}

function onParserExecuteCommon(server, socket, parser, state, ret, d) {
  //resetSocketTimeout(server, socket, state);

  if (ret instanceof Error) {
    debug('parse error', ret);
    server.emit('parse-error', socket);
  } 
  //upgrade not suprt for now
//  else if (parser.incoming && parser.incoming.upgrade) {
//    // Upgrade or CONNECT
//    var bytesParsed = ret;
//    var req = parser.incoming;
//    debug('SERVER upgrade or connect', req.method);//

//    if (!d)
//      d = parser.getCurrentBuffer();//

//    parser.finish();
//    freeParser(parser, req, null);
//    parser = null;//

//    var eventName = req.method === 'CONNECT' ? 'connect' : 'upgrade';
//    if (server.listenerCount(eventName) > 0) {
//      debug('SERVER have listener for %s', eventName);
//      var bodyHead = d.slice(bytesParsed, d.length);//

//      // TODO(isaacs): Need a way to reset a stream to fresh state
//      // IE, not flowing, and not explicitly paused.
//      socket._readableState.flowing = null;
//      server.emit(eventName, req, socket, bodyHead);
//    } else {
//      // Got upgrade header or CONNECT method, but have no handler.
//      socket.destroy();
//    }
//  }


}


// The following callback is issued after the headers have been read on a
// new message. In this callback we setup the response object and pass it
// to the user.
function parserOnIncoming(server, socket, state, req, keepAlive) {
//  console.log("------------------------");
//  return ;
  //resetSocketTimeout(server, socket, state);

//  state.incoming.push(req);

  // If the writable end isn't consuming, then stop reading
  // so that we don't become overwhelmed by a flood of
  // pipelined requests that may never be resolved.
  //if (!socket._paused) {
  //  var ws = socket._writableState;
  //  if (ws.needDrain || state.outgoingData >= ws.highWaterMark) {
  //    socket._paused = true;
  //    // We also need to pause the parser, but don't do that until after
  //    // the call to execute, because we may still be processing the last
  //    // chunk.
  //    socket.pause();
  //  }
  //}

  var res = new ServerResponse(req);
  //res._onPendingData = updateOutgoingData.bind(undefined, socket, state);

  res.shouldKeepAlive = keepAlive;

  //if (socket._httpMessage) {
  //  // There are already pending outgoing res, append.
  //  state.outgoing.push(res);
  //} else {
    res.assignSocket(socket);
  //}

  // When we're finished writing the response, check if this is the last
  // response, if so destroy the socket.
  //?res.on('finish',
  //?       resOnFinish.bind(undefined, req, res, socket, state, server));

  if (req.headers.expect !== undefined &&
      (req.httpVersionMajor === 1 && req.httpVersionMinor === 1)) {
    if (continueExpression.test(req.headers.expect)) {
      res._expect_continue = true;

      if (server.listenerCount('checkContinue') > 0) {
        server.emit('checkContinue', req, res);
      } else {
        res.writeContinue();
        server.emit('request', req, res);
      }
    } else {
      if (server.listenerCount('checkExpectation') > 0) {
        server.emit('checkExpectation', req, res);
      } else {
        res.writeHead(417);
        res.end();
      }
    }
  } else {
    server.emit('request', req, res);
  }
  return false; // Not a HEAD response. (Not even a response!)
}

//function resetSocketTimeout(server, socket, state) {
//  if (!state.keepAliveTimeoutSet)
//    return;
//
//  socket.setTimeout(server.timeout || 0);
//  state.keepAliveTimeoutSet = false;
//}

//function onSocketResume() {
  // It may seem that the socket is resumed, but this is an enemy's trick to
  // deceive us! `resume` is emitted asynchronously, and may be called from
  // `incoming.readStart()`. Stop the socket again here, just to preserve the
  // state.
  //
  // We don't care about stream semantics for the consumed socket anyway.
  if (this._paused) {
    this.pause();
    return;
  }

  if (this._handle && !this._handle.reading) {
    this._handle.reading = true;
    this._handle.readStart();
  }
//}
//
//function onSocketPause() {
//  if (this._handle && this._handle.reading) {
//    this._handle.reading = false;
//    this._handle.readStop();
//  }
//}
//
//function unconsume(parser, socket) {
//  if (socket._handle) {
//    if (parser._consumed)
//      parser.unconsume(socket._handle._externalStream);
//    parser._consumed = false;
//  }
//}


module.exports = {
//  STATUS_CODES,
//  Server,
ServerResponse,
//  _connectionListener: connectionListener
Parser
};

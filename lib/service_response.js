
'use strict';

const util = require('util');

const { methods, HTTPParser } = require('./http_parser');
const assert = require('assert').ok;
const common = require('_http_common');

const debug = common.debug;
const CRLF = common.CRLF;
const continueExpression = common.continueExpression;
const chunkExpression = common.chunkExpression;
const httpSocketSetup = common.httpSocketSetup;
const OutgoingMessage = require('_http_outgoing').OutgoingMessage;
//const { outHeadersKey, ondrain } = require('internal/http');
const errors = require('./errors');

const kOnExecute = HTTPParser.kOnExecute | 0;


function ServerResponse(command,req) {
  OutgoingMessage.call(this);
  this.command = command;

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

//ServerResponse.prototype._finish = function _finish() {
//  DTRACE_HTTP_SERVER_RESPONSE(this.connection);
//  LTTNG_HTTP_SERVER_RESPONSE(this.connection);
//  COUNTER_HTTP_SERVER_RESPONSE();
//  OutgoingMessage.prototype._finish.call(this);
//};


ServerResponse.prototype.statusCode = 200;
ServerResponse.prototype.statusMessage = undefined;

//function onServerResponseClose() {
//  // EventEmitter.emit makes a copy of the 'close' listeners array before
//  // calling the listeners. detachSocket() unregisters onServerResponseClose
//  // but if detachSocket() is called, directly or indirectly, by a 'close'
//  // listener, onServerResponseClose is still in that copy of the listeners
//  // array. That is, in the example below, b still gets called even though
//  // it's been removed by a:
//  //
//  //   var EventEmitter = require('events');
//  //   var obj = new EventEmitter();
//  //   obj.on('event', a);
//  //   obj.on('event', b);
//  //   function a() { obj.removeListener('event', b) }
//  //   function b() { throw "BAM!" }
//  //   obj.emit('event');  // throws
//  //
//  // Ergo, we need to deal with stale 'close' events and handle the case
//  // where the ServerResponse object has already been deconstructed.
//  // Fortunately, that requires only a single if check. :-)
//  if (this._httpMessage) this._httpMessage.emit('close');
//}


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
    throw new errors.RangeError('ERR_HTTP_INVALID_STATUS_CODE',
                                originalStatusCode);
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

module.exports ={
    ServerResponse
}
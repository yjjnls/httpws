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


class IncomingRequest {


  constructor(socket) {

    // Ensure that the server property of the socket is correctly set.
    // See https://github.com/nodejs/node/issues/13435
    if (socket.server === null)
      socket.server = this;

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

      var state = null;
    //    onData: null,
    //    onEnd: null,
    //    onClose: null,
    //    onDrain: null,
    //    outgoing: [],
    //    incoming: [],
    //    // `outgoingData` is an approximate amount of bytes queued through all
    //    // inactive responses. If more data than the high watermark is queued - we
    //    // need to pause TCP socket/HTTP parser, and wait until the data will be
    //    // sent to the client.
    //    outgoingData: 0,
    //    keepAliveTimeoutSet: false
    //  };
    //  state.onData = socketOnData.bind(undefined, this, socket, parser, state);
    //  state.onEnd = socketOnEnd.bind(undefined, this, socket, parser, state);
    //  state.onClose = socketOnClose.bind(undefined, socket, state);
    //  state.onDrain = socketOnDrain.bind(undefined, socket, state);
    //  socket.on('data', state.onData);
    //  socket.on('error', socketOnError);
    //  socket.on('end', state.onEnd);
    //  socket.on('close', state.onClose);
    //  socket.on('drain', state.onDrain);
    parser.onIncoming = parserOnIncoming.bind(undefined, this, socket, state);

    parser[kOnExecute] =
      onParserExecute.bind(undefined, this, socket, parser, state);
    this.parser = parser;

  }

  push(d) {
    var ret = this.parser.execute(d);
    console.log('ret=',ret);
    //onParserExecuteCommon(server, socket, parser, state, ret, d);
  }
}

function socketOnData(server, socket, parser, state, d) {
  assert(!socket._paused);
  debug('SERVER socketOnData %d', d.length);

  var ret = parser.execute(d);
  onParserExecuteCommon(server, socket, parser, state, ret, d);
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
  resetSocketTimeout(server, socket, state);

  if (ret instanceof Error) {
    debug('parse error', ret);
    socketOnError.call(socket, ret);
  } else if (parser.incoming && parser.incoming.upgrade) {
    // Upgrade or CONNECT
    var bytesParsed = ret;
    var req = parser.incoming;
    debug('SERVER upgrade or connect', req.method);

    if (!d)
      d = parser.getCurrentBuffer();

    socket.removeListener('data', state.onData);
    socket.removeListener('end', state.onEnd);
    socket.removeListener('close', state.onClose);
    socket.removeListener('drain', state.onDrain);
    socket.removeListener('drain', ondrain);
    unconsume(parser, socket);
    parser.finish();
    freeParser(parser, req, null);
    parser = null;

    var eventName = req.method === 'CONNECT' ? 'connect' : 'upgrade';
    if (server.listenerCount(eventName) > 0) {
      debug('SERVER have listener for %s', eventName);
      var bodyHead = d.slice(bytesParsed, d.length);

      // TODO(isaacs): Need a way to reset a stream to fresh state
      // IE, not flowing, and not explicitly paused.
      socket._readableState.flowing = null;
      server.emit(eventName, req, socket, bodyHead);
    } else {
      // Got upgrade header or CONNECT method, but have no handler.
      socket.destroy();
    }
  }


}


// The following callback is issued after the headers have been read on a
// new message. In this callback we setup the response object and pass it
// to the user.
function parserOnIncoming(server, socket, state, req, keepAlive) {
  console.log("------------------------");
  return ;
  //resetSocketTimeout(server, socket, state);

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

  var res = new ServerResponse(req);
  res._onPendingData = updateOutgoingData.bind(undefined, socket, state);

  res.shouldKeepAlive = keepAlive;

  if (socket._httpMessage) {
    // There are already pending outgoing res, append.
    state.outgoing.push(res);
  } else {
    res.assignSocket(socket);
  }

  // When we're finished writing the response, check if this is the last
  // response, if so destroy the socket.
  res.on('finish',
         resOnFinish.bind(undefined, req, res, socket, state, server));

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

function resetSocketTimeout(server, socket, state) {
  if (!state.keepAliveTimeoutSet)
    return;

  socket.setTimeout(server.timeout || 0);
  state.keepAliveTimeoutSet = false;
}

function onSocketResume() {
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
}

function onSocketPause() {
  if (this._handle && this._handle.reading) {
    this._handle.reading = false;
    this._handle.readStop();
  }
}

function unconsume(parser, socket) {
  if (socket._handle) {
    if (parser._consumed)
      parser.unconsume(socket._handle._externalStream);
    parser._consumed = false;
  }
}


module.exports = {
//  STATUS_CODES,
//  Server,
//  ServerResponse,
//  _connectionListener: connectionListener
IncomingRequest
};

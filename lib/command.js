


'use strict';

const EventEmitter = require('events').EventEmitter;
const assert = require('assert').ok;
const { methods, HTTPParser } = require('./http_parser');
const IncomingMessage = require('./_http_incoming').IncomingMessage;

const kOnHeaders = HTTPParser.kOnHeaders | 0;
const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0;
const kOnBody = HTTPParser.kOnBody | 0;
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0;
const kOnExecute = HTTPParser.kOnExecute | 0;


class Command extends EventEmitter {

    constructor(c, id, itype) {
        super();
        this.connection = c;
        this.app = c.app;
        this.Id  = id;

        this._incoming = null;
        this._outgoing = null;
        this._parser = this._createParser(itype);
        
        this.on('chunk', (data, last) => {
            var ret = this._parser.execute(data);
            this.onParserExecuteCommon(ret, d, last);
        })
    }

    _createParser(type) {
        assert(type == HTTPParser.REQUEST || HTTPParser.RESPONSE)

        var parser = new HTTPParser(type);

        parser._headers = [];
        parser._url = '';
        //        parser._consumed = false;
        //        
        //        parser.socket = null;
        //        parser.incoming = null;
        //        parser.outgoing = null;

        // Only called in the slow case where slow means
        // that the request headers were either fragmented
        // across multiple TCP packets or too large to be
        // processed in a single run. This method is also
        // called to process trailing HTTP headers.
        parser[kOnHeaders] = parserOnHeaders.bind(this);
        parser[kOnHeadersComplete] = parserOnHeadersComplete.bind(this);
        parser[kOnBody] = parserOnBody.bind(this);
        parser[kOnMessageComplete] = parserOnMessageComplete.bind(this);
        parser[kOnExecute] = null;

        //        var parser = parsers.alloc();
        //        parser.reinitialize(HTTPParser.REQUEST);
        //        parser.socket = this.socket;
        //        parser.incoming = null;
        //        parser.Id = id;
        //        parser.connection=this;
        //        this.requests[id]=parser;
        parser.onIncoming = this._parserOnIncoming.bind(this);
        parser[kOnExecute] = this._onParserExecute;
        return parser;
    }

    _onchunk(data, last) {
        var ret = this.parser.execute(d);
        this.onParserExecuteCommon(ret, d, last);
    }

    _parserOnIncoming( req, keepAlive) {
        throw new Error("NotImplement:parserOnIncoming");
    }
    _parserOnIncoming() {
        throw new Error("NotImplement:onParserExecute");
    }
    _onParserExecuteCommon() { };

    

}

// Only called in the slow case where slow means
// that the request headers were either fragmented
// across multiple TCP packets or too large to be
// processed in a single run. This method is also
// called to process trailing HTTP headers.
function parserOnHeaders(headers, url) {
    // Once we exceeded headers limit - stop collecting them
    if (this.maxHeaderPairs <= 0 ||
        this._headers.length < this.maxHeaderPairs) {
        this._headers = this._headers.concat(headers);
    }
    this._url += url;
}


// `headers` and `url` are set only if .onHeaders() has not been called for
// this request.
// `url` is not set for response parsers but that's not applicable here since
// all our parsers are request parsers.
function parserOnHeadersComplete(versionMajor, versionMinor, headers, method,
    url, statusCode, statusMessage, upgrade,
    shouldKeepAlive) {
    var parser = this._parser;

    if (!headers) {
        headers = parser._headers;
        parser._headers = [];
    }

    if (!url) {
        url = parser._url;
        parser._url = '';
    }


    var incoming = this._incoming = new IncomingMessage();


    incoming.httpVersionMajor = versionMajor;
    incoming.httpVersionMinor = versionMinor;
    incoming.httpVersion = versionMajor + '.' + versionMinor;
    incoming.url = url;

    var n = headers.length;

    // If parser.maxHeaderPairs <= 0 assume that there's no limit.
    if (this.maxHeaderPairs > 0)
        n = Math.min(n, this.maxHeaderPairs);

    incoming._addHeaderLines(headers, n);

    if (typeof method === 'number') {
        // server only
        incoming.method = methods[method];
    } else {
        // client only
        incoming.statusCode = statusCode;
        incoming.statusMessage = statusMessage;
    }
    var outgoing = this._outgoing;

    if (upgrade && outgoing !== null && !outgoing.upgrading) {
        // The client made non-upgrade request, and server is just advertising
        // supported protocols.
        //
        // See RFC7230 Section 6.7
        upgrade = false;
    }

    incoming.upgrade = upgrade;

    var skipBody = 0; // response to HEAD or CONNECT

    if (!upgrade) {
        // For upgraded connections and CONNECT method request, we'll emit this
        // after parser.execute so that we can capture the first part of the new
        // protocol.
        skipBody = parser.onIncoming(incoming, shouldKeepAlive);
    }

    if (typeof skipBody !== 'number')
        return skipBody ? 1 : 0;
    else
        return skipBody;
}


// XXX This is a mess.
// TODO: http.Parser should be a Writable emits request/response events.
function parserOnBody(b, start, len) {
    var parser = this._parser;
    var stream = this._incoming;

    // if the stream has already been removed, then drop it.
    if (!stream)
        return;

    //-    var socket = stream.socket;

    // pretend this was the result of a stream._read call.
    if (len > 0 && !stream._dumped) {
        var slice = b.slice(start, start + len);
        var ret = stream.push(slice);
        //-- if (!ret)
        //--   readStop(socket);
    }
}


function parserOnMessageComplete() {
    var parser = this._parser;
    var stream = this._incoming;

    if (stream) {
        stream.complete = true;
        // Emit any trailing headers.
        var headers = parser._headers;
        if (headers) {
            stream._addHeaderLines(headers, headers.length);
            parser._headers = [];
            parser._url = '';
        }

        // For emit end event
        stream.push(null);
    }
    /* TODEL:
      // force to read the next incoming message
      readStart(parser.socket);
    */
}


module.exports = {
    Command
}
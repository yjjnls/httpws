

'use strict';

const Command=require('./command').Command;
const ServerResponse = require('./service_response').ServerResponse;
//const binding = require('./http_parser');
//const methods = binding.methods;
const HTTPParser = require('./http_parser').HTTPParser;

const chunkExpression = /(?:^|\W)chunked(?:$|\W)/i
const continueExpression =  /(?:^|\W)100-continue(?:$|\W)/i



class ServiceCommand extends Command {
    constructor(connection, id){       
        super(connection, id, HTTPParser.REQUEST);
        var n = this.app.maxHeadersCount;
        // Propagate headers limit from server instance to parser
        if ( n && typeof n === 'number') {
            this._parser.maxHeaderPairs = n << 1;
        } else {
            // Set default value because parser may be reused from FreeList
            this._parser.maxHeaderPairs = 2000;
        }

    }

    // The following callback is issued after the headers have been read on a
    // new message. In this callback we setup the response object and pass it
    // to the user.
    _parserOnIncoming( req, keepAlive) {


        var res = new ServerResponse(this, req);
        //res._onPendingData = updateOutgoingData.bind(undefined, socket, state);

        //res.shouldKeepAlive = keepAlive;

        // When we're finished writing the response, check if this is the last
        // response, if so destroy the socket.
        //res.on('finish',
        //    resOnFinish.bind(undefined, req, res, socket, state, server));

        if (req.headers.expect !== undefined &&
            (req.httpVersionMajor === 1 && req.httpVersionMinor === 1)) {
            if (continueExpression.test(req.headers.expect)) {
                res._expect_continue = true;
                var app = this.app;

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
            this.app.emit('request', req, res);
        }
        return false; // Not a HEAD response. (Not even a response!)
    }
    
}

module.exports={
    ServiceCommand
}
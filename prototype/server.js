'use strict';

const Connection = require('./connection').Connection;
const parseWSMessage = require('./http_common').parseWSMessage;
const EventEmitter = require('events').EventEmitter
const ws = require('ws');
class Server extends EventEmitter {    
     
      constructor(requestListener ){
          super();
    
        if (requestListener) {
          this.on('request', requestListener);
        }
      
        // Similar option to this. Too lazy to write my own docs.
        // http://www.squid-cache.org/Doc/config/half_closed_clients/
        // http://wiki.squid-cache.org/SquidFaq/InnerWorkings#What_is_a_half-closed_filedescriptor.3F
        this.httpAllowHalfOpen = false;
      
        //this.on('connection', _connectionListener);
      
        this.timeout = 2 * 60 * 1000;
        this.keepAliveTimeout = 5000;
        this._pendingResponseData = 0;
        this.maxHeadersCount = null;

        this.connections={};
    
        this.listen = this.listen.bind(this);
        this.login  = this._login.bind(this);
        
    
    
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

      _login(url){
          return url;
      }
    
    
    
      listen(options){
    
      
        var self = this;
        var server = this;
        this._wss = new ws.Server(options);
      
        this._wss.on('connection', function( ws, request  ){
    
          var name = self.login( request.url );
          if( typeof name === 'string'){
              var connection  = new Connection(ws, server);
              
              ws.connection = connection
              server.connections[ws] = connection;
              
            //this.emit('connection',socket);
          } else {
            ws.send(':message 0' + CRLF
                   +'Content-Type:application/json' + CRLF 
                   +CRLF
                   +JSON.stringify(name) );
            ws.close();
            return;
          }
      
          ws.on('message',function(data,flags){
            var m = parseWSMessage(data);
            if( !m ){
              return;
            }
            if( m.type === 'request' && ws.connection ){
                ws.connection.pushChunk( m );
//              client = this._clients[ws];
//              client.socket.emit('data', m.httpMessage);
            }
    
          });
      
          ws.on('close',function(){
            self.emit('close',ws);
          });
        });  
      };
    }
    
    module.exports={
        Server
    }
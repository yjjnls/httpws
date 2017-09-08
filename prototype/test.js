'use strict';
//const IncomingRequest = require('./incoming_request').IncomingRequest;
//const CRLF = require('./http_common').CRLF;
//
//var socket={};
//var parser = new IncomingRequest(socket);
//
//var h1='POST /1/2 HTTP/1.1' +CRLF 
//      +'Content-Length: 6' +CRLF;
//var h2='Content-Type: application/json' +CRLF
//      +CRLF
//      +'123456';
//parser.push(Buffer(h1));
//
//parser.push(Buffer(h2));
//parser.incoming.on('data',function(d){
//  console.log("=>",d);
//})
//parser.incoming.on('end',function(){
//  console.log("=>>> END");
//})
////parser.push(Buffer(CRLF + "123456"));
//console.log('----------END---------');
//
//
//class CommandPool{
//
//  constructor(socket){
//
//    this.requests=Map()
//    
//    this.responses=Map()
//
//  }
//
//}
//
//
//var command={
//  parser,
//
//}
//
//
//function RequestParser(socket, sn){
//  
//
//  
//}

//var b=Buffer(':req');
//console.log("b[0]===':'",b[0]===':')
//console.log("b[0]===':'",b[0]=='\:')


const Server = require('./server').Server;

var s = new Server(function(req,res){
  console.log(req);

});
s.listen({port:8080});
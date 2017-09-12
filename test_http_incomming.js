
'use strict';

const Connection = require('./lib/connection').Connection;
const EventEmitter = require('events').EventEmitter;

const CRLF='\r\n';
var text =':request 1 ' + CRLF
         +'POST /a/b/c HTTP/1.1' + CRLF
         +'Content-Type: application/text' + CRLF
         +'Content-Length: 6' +CRLF
         +CRLF
         +'123456';
var chunk=Buffer(text);

class App extends EventEmitter {
    constructor( cb) {
        super();
        this.on('request',cb)
        var c = new Connection(null,this);
        c.emit('chunk',chunk);
    }
}

var app= new App( (req,res) =>{
    console.log(req);
    req.on('data',(data)=>{
        console.log('-----------data----------');
        console.log(data);
    });
    req.on('end',()=>{
        console.log('-----------end----------');
    });

});

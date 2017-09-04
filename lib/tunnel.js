

'use strict';


require ('ws')

var _tunnels=[]

function Tunnel(options){
    if (!(this instanceof Tunnel))
        return new Tunnel(options);
    this.ws        = null;
    this.server    = null;
    this.host      = undefined;
    this.peer_host = undefined;

    if( typeof options === 'string'){

    }

    EventEmitter.call(this);
}


Tunnel.prototype.request = function( options, cb ){
}

Tunnel.prototype.service = function( cb ,prefix='/'){

}



///////////////////////////////////////////
//see http://www.jianshu.com/p/5a80f693517f
//http://www.jianshu.com/p/b5973ef87f73
//                  Client.Request         
client = httpws.createClient( url ) // url is be ws://hostname... or wss://hostanme which is real ws url

var req = client.request( options, function( res ){
    res.setEncoding("utf-8");
    res.on("data",function(chunk){
          console.log(chunk.toString())
    });
});

req.on('error',function(err){
    console.log(err.message);
});

req.write(....);
req.end();

//                Client.Service          

client.service( function( req, res ){
    
    req.on('data',function( chunk ){
    });
    
    req.on('end',function(){
        
        res.writeHead(200,{
            "content-type":"text/plain"
            });
        res.write(chunk );
        res.end();'
    });
});


//once client succesfuly connect with server, there may be 
//and notification from server side to inidate the (virtual) hostname
//of the connection. If no hostname idication, the connection hostname
//should be take as url pathname part.
client.on('connection',function(hostname){
    console.log('the hostname of connection`${this.url}` is `${hostname}`');
});
    
client.on('error',function( err ){
    console.log(err.message);
});

//  SERVER node.js only
httpws.createServer( function( req,res ){
    //the usesage same as client.service
}).listen( port | { server: http.server} );


// there will be many connection after server estabilised
// and the application also need send request to the peer （
// which would corresponding client.service）

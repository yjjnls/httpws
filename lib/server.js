




'use strict';


const WS  = require ('ws')
const Url = require ('url')

function Server(requestListener){
    EventEmitter.call(this);
}
util.inherits(Server, events.EventEmitter);

Server.prototype.listen = function (options){
    var self = this;
    

    var wss = new WS.Server(options);
    wss.on('connection', function( ws, request  ){
        var tunnel = new Tunnel();
        tunnel.ws     = ws;
        tunnel.server = this;

        var name = self.login( request.url );
        if( typeof name === 'string'){
            tunnel.hostname = name;
        } else {
            ws.send(':message 0 \r\nContent-Type:appliction/json\r\n\r\n' + JSON.stringify(name))
            ws.close();
            return;
        }
        httpws.globalTunnels.add(tunnel);
        return
    });

}

Server.prototype.login = function (url){

}


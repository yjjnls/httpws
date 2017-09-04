

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


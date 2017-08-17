/**
 * Virtual Host module.
 * @module httpws/vhost
 * 
 * 
 */

var _hosts=[]

function addHost(name, socket ,server){
    server = server || null;
    var host = null;
    for(i=0; i < _hosts.length; i++ ){
        if( _hosts[i].name === name){
            return false;
        }
    }

    host = new Host(name, socket,server);
    _hosts.push( host );
    console.log('@hosts',_hosts)
    return true;
}

function removeHost(hostname){

    for(i=0; i < _hosts.length; i++ ){
        if( _hosts[i].name === name){
            _hosts.splice(i,1);
            return true;
        }
    }
    return false;

}

function getHost(name){
    console.log('*host',_hosts);
    for(i=0; i < _hosts.length; i++ ){
        if (_hosts[i].name === name){
            return _hosts[i];
        }
    }
    return null;
}


function Host(name, socket ,server){
     this.server = server;
     this.socket = socket;
     this.name=name;
     this.requests=[];
};

Host.prototype.addhost = function _addhost(socket,request){
    var host = this.server.connection_url2host(request.url);
    if ( this.hosts[host] ){
        return false;
    }
    this.hosts[host]={
        'socket':socket,
        'request':{}
    }
    return true;
}




module.exports = {
    Host,
    hosts:_hosts,
    getHost,
    addHost,
    getHost,
    removeHost

  };
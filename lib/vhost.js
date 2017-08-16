/**
 * Virtual Host module.
 * @module httpws/vhost
 * 
 * 
 */

 function VHost(server){
     this.server=server;
     this.hosts={};
 };

 VHost.prototype.addhost = function _addhost(socket,request){
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
    VHost
  };
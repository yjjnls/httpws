
'use strict';

const ServiceParser=require('./service-message').Parser;

class Connection {
    
    constructor( socket, server ) {
        this.socket = socket;
        this.server = server;
        this.iRequests={}; //incoming requests parser
        this.oRequests={}; //outcoming requests parser

        this.pushChunk = this.pushChunk.bind(this);
    }

    pushChunk( m){
        if( m.type === 'request'){
            var parser = this.iRequests[m.id];
            if( !parser ){
                parser = ServiceParser(this.socket,m.id);
                parser.connection = this;
                this.iRequests[m.id] = parser;
            }

            parser.push(Buffer(m.httpMessage));
        } else if( type === 'response'){

        }
        
    }
}

module.exports={
    Connection
}
'use strict';

function HttpStruct(message) {
    this._msg_buf = message;
    //header & body
    this.header = {};
    this.body = null;
    this.httpVersion = null;
    //http msg type('invalid'/'request'/'response')
    this.type = null;
    this.offset_header = -1;
    this.offset_body = -1;
    //request use only
    this.method = null;
    this.url = null;
    //response use only
    this.status_code = 0;
    this.description = null;
}

//just parse the request/response line to tell weather the msg 
//is a http request or response, or an invalid message
HttpStruct.prototype.parseType = function parseType() {
    for (var i = 1; i < this._msg_buf.length - 1; ++i) {
        if (this._msg_buf[i - 1] == 0x0d &&
            this._msg_buf[i] == 0x0a) {
            this.offset_header = i;
            break;
        }
    }
    for (var i = this.offset_header + 4; i < this._msg_buf.length - 1; ++i) {
        if (this._msg_buf[i - 3] == 0x0d && this._msg_buf[i - 2] == 0x0a &&
            this._msg_buf[i - 1] == 0x0d && this._msg_buf[i] == 0x0a) {
            this.offset_body = i;
            break;
        }
    }
    if (this.offset_header == -1 || this.offset_body == -1) {
        this.type = 'invalid';
        return false;
    }
    var first_line = this._msg_buf.toString('UTF-8', 0, this.offset_header - 1);
    var arr = first_line.split(' ');
    if (arr.length != 3) {
        this.type = 'invalid';
        return false;
    }

    var http_method = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'];
    if (http_method.indexOf(arr[0]) != -1) {
        this.type = 'request';
        this.method = arr[0];
        this.url = arr[1];
        this.httpVersion = arr[2];
    } else {
        this.type = 'response';
        this.status_code = arr[1];
        this.description = arr[2];
        this.httpVersion = arr[0];
    }
    return true;
};

HttpStruct.prototype.parse = function parse() {
    if (this.type == null) {
        this.parseType();
    }
    if (this.type == 'invalid') {
        return false;
    }
    //parse header
    var header_str = this._msg_buf.toString('UTF-8', this.offset_header + 1, this.offset_body - 1);
    var arr = header_str.split('\r\n');
    var tmp;
    for (var i = 0; i < arr.length - 1; ++i) {
        tmp = arr[i].split(':');
        this.header[tmp[0]] = tmp[1];
    }
    //extract body
    this.body = this._msg_buf.toString('UTF-8', this.offset_body + 1, this._msg_buf.length);
    return true;
}


HttpStruct.prototype.serialize = function serialize() {
    //...
}    
module.exports = {
    HttpStruct
};
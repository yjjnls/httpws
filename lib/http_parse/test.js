var HttpStruct = require('./http_parse.js').HttpStruct;

var buf = new Buffer("GET /user/id HTTP/1.1\r\nHost:xxx\r\ncontent-type:text\r\n\r\n{......}");
var msg_parse = new HttpStruct(buf);
msg_parse.parse();
// msg_parse.parseType();
console.log(msg_parse);

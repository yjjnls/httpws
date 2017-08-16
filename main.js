httpws = require('./lib/http')

httpws.createServer( function( req, res){
    console.log('got request !');
    req.on('data',function (data) {
        console.log('receive data\n',data);
    });
    req.on('end',function(){
        console.log('end');

    });

}).listen(8080);

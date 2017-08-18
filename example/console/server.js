httpws = require('../../node/httpws')

console.log("HTTPWS Console Server")
httpws.createServer( function( req, res){

    var body;

    req.on('data',function (data) {
        if( body ){
            body +=data;
        }else{
            body =data;
        }
        console.log('receive data\n',data);
    });
    
    req.on('end',function(){
        res.write("headers:" + JSON.stringify( req.headers()));
        res.write("\n------body-----\n");
        res.write( body);
        res.end();

        //request = httpws.request('http://abc/COMEON');
        //request.write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        //request.end();
    
    });

//    res.end();

}).listen(8080);

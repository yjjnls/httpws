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
        res.write("\n            ******** Request Parse *********\n");
        res.write("\n            --------    Header     ---------\n");
        res.write(JSON.stringify( req.headers,null,2));
        res.write("\n            --------    Body       ---------\n");
        res.write( body);
        res.write("\n            ********     ~End~      *********\n");
        
        res.end();

        var connections = httpws.globalAgent.connections;
        for( var i=0; i < connections.length; i++ ){
            var c=connections[i];
            var name = c.name;
            console.log(name);


            request = httpws.request(`http://{${name}}/Hello`,function( res ){
                res.on('data', function(chunk){
                    console.log(`${name} response:`+chunk);
                })
                res.on('end',function(){
                    console.log(`${name} response completed.`);
                });
            });
            request.write(`I am ${name}.`);
            request.end();

        }

        //request = httpws.request('http://abc/COMEON');
        //request.write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        //request.end();
    
    });

//    res.end();

}).listen(8080);

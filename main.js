httpws = require('./lib/http')

httpws.createServer( function( req, res){
    console.log('got request !');
    console.log(req.headers);
    console.log(req.url);
    req.on('data',function (data) {
        console.log('receive data\n',data);
    });
    req.on('end',function(){
        console.log('end');
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.write("<html>");
        res.write("<head>");
        res.write("<title>Hello World Page</title>");
        res.write("</head>");
        res.write("<body>");
        res.write("Hello World!");
        res.write("</body>");
        res.write("</html>");
        res.end();
    });

}).listen(8080);

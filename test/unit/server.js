var url  = require("url"),
    fs=require("fs"),
    http=require("http"),
    WebSocket = require('ws'),
    path = require("path");
const httpws = require('../../node/httpws');

const server = http.createServer(function (req, res) {

    let root = path.resolve(process.argv[2] || '.');

    //console.log('Static root dir: ' + root);

    let filepath = 'test/unit/index.html';

    let pathname = root + url.parse(req.url).pathname;

    if (path.extname(pathname)=="") {
        pathname += "/";
    }
    if (pathname.charAt(pathname.length-1)=="/"){
        pathname += filepath;
    }

    fs.exists(pathname,function(exists){
        if(exists){
            switch(path.extname(pathname)){
                case ".html":
                    res.writeHead(200, {"Content-Type": "text/html"});
                    break;
                case ".js":
                    res.writeHead(200, {"Content-Type": "text/javascript"});
                    break;
                case ".css":
                    res.writeHead(200, {"Content-Type": "text/css"});
                    break;
                case ".gif":
                    res.writeHead(200, {"Content-Type": "image/gif"});
                    break;
                case ".jpg":
                    res.writeHead(200, {"Content-Type": "image/jpeg"});
                    break;
                case ".png":
                    res.writeHead(200, {"Content-Type": "image/png"});
                    break;
                default:
                    res.writeHead(200, {"Content-Type": "application/octet-stream"});
            }

            fs.readFile(pathname,function (err,data){
                res.end(data);
            });
        } else {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.end("<h1>404 Not Found</h1>");
        }
    });
});
//
//const wss = new WebSocket.Server({ server_ });
//
//wss.on('connection', function connection(ws, req) {
//    const location = url.parse(req.url, true);
//    // You might use location.query.access_token to authenticate or share sessions
//    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)
//
//    ws.on('message', function incoming(message) {
//        console.log('received: %s', message);
//    });
//
//    ws.send('something');
//});

server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
});


function startWith(str, prefix){
    return 0 ==  str.indexOf(prefix);
}

httpws.createServer( function( req, res){


    if( startWith(req.url,'/unittest/echo')){
        OnEcho( req,res);
    }
    else if(startWith(req.url,'/unittest/peerecho')) {
        OnPeerEcho(req, res);
    }
    else {
        res.statusCode = 404;
    }

}).listen({server});


function OnEcho(req,res){
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

        var content={
            headers: JSON.stringify(req.headers),
            body
        }

        res.write(JSON.stringify(content,null,2));

        res.end();

    });
}

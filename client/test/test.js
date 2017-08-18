
const options = {
    hostname: 'localhost',
    port: 8080
};

let wsEndPoint = new HttpWsClient(options);

let request_client = wsEndPoint.CreateClientRequest({ method: 'post', path: '/', headers: {
    date: new Date()
}}, res => {
    res.on('data', (message) => {
        console.log('data: ' + message);
        if(request_client) {
            console.log('still exists');
        }
    });

    res.on('end', message => {
        console.log('end: ' + message);
    });


});

function send() {
    console.log("send message");
    request_client.write('hello ');
    request_client.end('world');
}

let clientServer = wsEndPoint.CreateClientServer(function (request, response) {
    console.log(request, response.write('nihao'));
    response.end(' baibai')
});

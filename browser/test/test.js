
const options = {
    hostname: 'localhost',
    port: 8080
};

let wsTunnel = new HttpWsConnection(options);

wsTunnel.addServiceListener(function (request, response) {
    console.log(request, response.write('nihao'));
    response.end(' baibai')
});

let request_client = wsTunnel.createClientRequest({ method: 'post', path: '/', headers: {
    date: new Date()
}}, res => {
    res.on('data', (message) => {
        console.log('data: ' + message);
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

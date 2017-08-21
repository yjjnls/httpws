var wsConnection;

QUnit.module( "Host to Server Echo Test", {
    before: function() {
        // prepare something once for all tests
        console.log("Test setup");

        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/a'
        };

        wsConnection = new HttpWsConnection(options);
    },
    beforeEach: function() {
        // prepare something before each test
    },
    afterEach: function() {
        // clean up after each test
    },
    after: function() {
        // clean up once after all tests are done
        wsConnection.close();
    }
});
QUnit.test( "post test", function( assert ) {
    let done = assert.async();

    wsConnection.onConnected = function () {
        let request_client = wsConnection.createClientRequest({ method: 'post', path: '/unittest/echo', headers: {
            date: (new Date()).toGMTString()
        }}, res => {
            let data = '';
            res.on('data', (message) => {
                console.log('data: ' + message);
                data += message;
            });

            res.on('end', message => {
                console.log('end: ' + message);
                data += message;
                assert.equal('helloworld', data, "")
                done();
            });
        });


        request_client.write('hello');
        request_client.end('world');
        console.log("message sent");
    };
});



/*wsTunnel.addServiceListener(function (request, response) {
    console.log(request, response.write('nihao'));
    response.end(' baibai')
});*/

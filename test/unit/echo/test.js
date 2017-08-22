var wsConnection;


const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/a'
};

wsConnection = new HttpWsConnection(options);

wsConnection.onConnected = function () {
    QUnit.module( "Host to Server Echo Test", {
        before: function() {
            // prepare something once for all tests
            console.log("Test setup");

        },
        beforeEach: function() {
            // prepare something before each test
        },
        afterEach: function() {
            // clean up after each test
        },
        after: function() {
            // clean up once after all tests are done
            //wsConnection.close();
        }
    });
    QUnit.test( "post test", function( assert ) {
        let done = assert.async();

        let headers;
        let msgToSent = 'hello world';
        let request_client = wsConnection.createClientRequest({ method: 'post', path: '/unittest/echo', headers: {
            date: (new Date()).toGMTString()
        }}, res => {
            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                }
            });

            res.on('end', message => {
                assert.equal(headerStr, JSON.stringify(headers).trim(), "Get same headers from server.");
                assert.equal(msgToSent, content, "Get same content from server.");
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end();
        headers = request_client.getHeaders();
        console.log("message sent");
    });

    QUnit.test( "get test", function( assert ) {
        let done = assert.async();

        let headers;
        let request_client = wsConnection.createClientRequest({ method: 'get', path: '/unittest/echo', headers: {
            date: (new Date()).toGMTString()
        }}, res => {
            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                }
            });

            res.on('end', message => {
                assert.equal(headerStr, JSON.stringify(headers).trim(), "Get same headers from server.");
                assert.equal(undefined, content, "Get same content from server.");
                done();
            });
        });

        request_client.write('hello');
        request_client.end('world');
        headers = request_client.getHeaders();
        console.log("message sent");
    });

    QUnit.test( "put test", function( assert ) {
        let done = assert.async();
        let msgToSent = 'put something';
        let headers;
        let request_client = wsConnection.createClientRequest({ method: 'put', path: '/unittest/echo', headers: {
            date: (new Date()).toGMTString()
        }}, res => {
            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                }
            });

            res.on('end', message => {
                assert.equal(headerStr, JSON.stringify(headers).trim(), "Get same headers from server.");
                assert.equal(msgToSent, content, "Get same content from server.");
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end('');
        headers = request_client.getHeaders();
        console.log("message sent");
    });

    QUnit.test( "delete test", function( assert ) {
        let done = assert.async();
        let msgToSent = 'put something';
        let headers;
        let request_client = wsConnection.createClientRequest({ method: 'delete', path: '/unittest/echo', headers: {
            date: (new Date()).toGMTString()
        }}, res => {
            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                }
            });

            res.on('end', message => {
                assert.equal(headerStr, JSON.stringify(headers).trim(), "Get same headers from server.");
                assert.equal(msgToSent, content, "Get same content from server.");
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end('');
        headers = request_client.getHeaders();
        console.log("message sent");
    });

};




/*wsTunnel.addServiceListener(function (request, response) {
    console.log(request, response.write('nihao'));
    response.end(' baibai')
});*/

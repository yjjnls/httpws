var wsConnectionA, wsConnectionB;

const optionsA = {
    hostname: 'localhost',
    port: 8080,
    path: '/a'
};

const optionsB = {
    hostname: 'localhost',
    port: 8080,
    path: '/b'
};

wsConnectionA = new HttpWsConnection(optionsA);
wsConnectionB = new HttpWsConnection(optionsB);

wsConnectionB.onConnected = function () {
    QUnit.module( "Peer to Peer Echo Test", {
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
            wsConnectionA.close();
            wsConnectionB.close();
        }
    });

    QUnit.test( "post test", function( assert ) {
        let done = assert.async();

        let msgToSent = 'hello world';
        let msgToSent2 = 'nihao baibai';

        function serviceListener(request, response) {
            assert.equal(request.method, 'POST', 'Request method from wsconnectionA test');
            assert.equal(request.path, '/unittest/peertopeer', 'Request path from wsconnectionA test');
            assert.equal(request.headers.get('host'), 'b', 'Request header host from wsconnectionA test');
            assert.equal(request.text(), msgToSent, 'Request content from wsconnectionA test');
            response.write(msgToSent2);
            response.end();
        };

        wsConnectionB.addServiceListener(serviceListener);

        let request_client = wsConnectionA.createClientRequest({ method: 'post', path: '/unittest/peertopeer', headers: {
            date: (new Date()).toGMTString(),
            host: 'b'
        }}, res => {
            assert.equal(true, res.ok, 'Get response from wsConnectionB.');

            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                } else if(typeof message === 'string') {
                    content = message;
                }
            });

            res.on('end', message => {
                assert.equal(msgToSent2, content, "Response content from wsConnectionB.");
                wsConnectionB.removeServiceListener(serviceListener);
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end();
        console.log("message sent");
    });

    QUnit.test( "get test", function( assert ) {
        let done = assert.async();

        let msgToSent = 'hello world';
        let msgToSent2 = 'nihao baibai';

        function serviceListener(request, response) {
            assert.equal(request.method, 'GET', 'Request method from wsconnectionA test');
            assert.equal(request.path, '/unittest/peertopeer', 'Request path from wsconnectionA test');
            assert.equal(request.headers.get('host'), 'b', 'Request header host from wsconnectionA test');
            assert.equal(request.text(), '', 'Request content from wsconnectionA test');
            response.write(msgToSent2);
            response.end();
        };

        wsConnectionB.addServiceListener(serviceListener);

        let request_client = wsConnectionA.createClientRequest({ method: 'get', path: '/unittest/peertopeer', headers: {
            date: (new Date()).toGMTString(),
            host: 'b'
        }}, res => {
            assert.equal(true, res.ok, 'Get response from wsConnectionB.');

            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                } else if(typeof message === 'string') {
                    content = message;
                }
            });

            res.on('end', message => {
                assert.equal(msgToSent2, content, "Response content from wsConnectionB.");
                wsConnectionB.removeServiceListener(serviceListener);
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end();
        console.log("message sent");
    });

    QUnit.test( "put test", function( assert ) {
        let done = assert.async();

        let msgToSent = 'hello world';
        let msgToSent2 = 'nihao baibai';

        function serviceListener(request, response) {
            assert.equal(request.method, 'PUT', 'Request method from wsconnectionA test');
            assert.equal(request.path, '/unittest/peertopeer', 'Request path from wsconnectionA test');
            assert.equal(request.headers.get('host'), 'b', 'Request header host from wsconnectionA test');
            assert.equal(request.text(), msgToSent, 'Request content from wsconnectionA test');
            response.write(msgToSent2);
            response.end();
        };

        wsConnectionB.addServiceListener(serviceListener);

        let request_client = wsConnectionA.createClientRequest({ method: 'put', path: '/unittest/peertopeer', headers: {
            date: (new Date()).toGMTString(),
            host: 'b'
        }}, res => {
            assert.equal(true, res.ok, 'Get response from wsConnectionB.');

            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                } else if(typeof message === 'string') {
                    content = message;
                }
            });

            res.on('end', message => {
                assert.equal(msgToSent2, content, "Response content from wsConnectionB.");
                wsConnectionB.removeServiceListener(serviceListener);
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end();
        console.log("message sent");
    });

    QUnit.test( "delete test", function( assert ) {
        let done = assert.async();

        let msgToSent = 'hello world';
        let msgToSent2 = 'nihao baibai';

        function serviceListener(request, response) {
            assert.equal(request.method, 'DELETE', 'Request method from wsconnectionA test');
            assert.equal(request.path, '/unittest/peertopeer', 'Request path from wsconnectionA test');
            assert.equal(request.headers.get('host'), 'b', 'Request header host from wsconnectionA test');
            assert.equal(request.text(), msgToSent, 'Request content from wsconnectionA test');
            response.write(msgToSent2);
            response.end();
        };

        wsConnectionB.addServiceListener(serviceListener);

        let request_client = wsConnectionA.createClientRequest({ method: 'delete', path: '/unittest/peertopeer', headers: {
            date: (new Date()).toGMTString(),
            host: 'b'
        }}, res => {
            assert.equal(true, res.ok, 'Get response from wsConnectionB.');

            let content = '';
            let headerStr;
            res.on('data', (message) => {
                if(isJSON(message)) {
                    let msg = JSON.parse(message);
                    content = msg.body;
                    headerStr = trim(msg.headers);
                } else if(typeof message === 'string') {
                    content = message;
                }
            });

            res.on('end', message => {
                assert.equal(msgToSent2, content, "Response content from wsConnectionB.");
                wsConnectionB.removeServiceListener(serviceListener);
                done();
            });
        });

        request_client.write(msgToSent);
        request_client.end();
        console.log("message sent");
    });
};

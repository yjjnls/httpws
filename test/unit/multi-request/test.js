var wsConnection1, wsConnection2;

const options1 = {
    hostname: 'localhost',
    port: 8080,
    path: '/a1'
};

const options2 = {
    hostname: 'localhost',
    port: 8080,
    path: '/b1'
};

wsConnection1 = new HttpWsConnection(options1);
wsConnection2 = new HttpWsConnection(options2);

const requestNum = 100;

wsConnection2.onConnected = function () {
    QUnit.module( "Multi-request Peer to Peer Echo Test", {
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
            wsConnection1.close();
            wsConnection2.close();
        }
    });

    QUnit.test( "post test", function( assert ) {
        let done = assert.async();

        let msgToSent = 'hello world';
        let msgToSent2 = 'nihao baibai';
        let count = 0;

        let serviceListener = function (request, response) {
            let i = count++;
            console.log('serviceListener: ' + i)
            assert.equal(request.method, 'POST', 'Request method from wsconnection1 test');
            assert.equal(request.path, '/unittest/peertopeer', 'Request path from wsconnection1 test');
            assert.equal(request.headers.get('host'), 'b1', 'Request header host from wsconnection1 test');
            assert.equal(request.text(), msgToSent + i, 'Request content from wsconnection1 test');
            response.write(msgToSent2 + i);
            response.end();
        };

        wsConnection2.addServiceListener(serviceListener);

        for(let i = 0; i < requestNum; ++i) {

            let request_client = wsConnection1.createClientRequest({ method: 'post', path: '/unittest/peertopeer', headers: {
                date: (new Date()).toGMTString(),
                host: 'b1'
            }}, res => {
                assert.equal(true, res.ok, 'Get response from wsConnection2.');

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
                    assert.equal(msgToSent2 + i, content, "Response content from wsConnection2.");
                    if(i == requestNum - 1) {
                        wsConnection2.removeServiceListener(serviceListener);
                        done();
                    }
                });
            });

            request_client.write(msgToSent + i);
            request_client.end();
            console.log("message sent");
        }
    });

}

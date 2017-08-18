
class HttpWsClient {
    constructor(options) {
        if (typeof options === 'string')
        {
            this.ws = new WebSocket(options);
        }
        else if(options.hostname && options.port)
        {
            this.ws = new WebSocket(`ws://${options.hostname}:${options.port}`);
            if(this.ws) {
                this.ws.binaryType = "arraybuffer";

                this.ws.onerror = onError.bind(this);

                this.ws.onopen = onOpen.bind(this);

                this.ws.onmessage = onMessage.bind(this);

                this.ws.onclose = onClose.bind(this);
            }
        }
        else {
            throw new Error('Unable to connect to the domain name');
        }
        this.requests = new Map();
        this.clientServer = null;
    }

    _AddRequest(requestId, request) {
        this.requests.set(requestId, request);
    }

    CreateClientRequest(options, cb) {
        let req = new Request(options);
        let clientRequest = new ClientRequest(this.ws, req, cb);
        req.headers.set('request-id',clientRequest.getRequestId());
        this.requestId = clientRequest.getRequestId();
        this._AddRequest(clientRequest.getRequestId(), clientRequest);
        return clientRequest;
    }

    CreateClientServer(cb) {
        if(this.clientServer) {
            console.log('Client Server has been created!');
            return;
        }
        this.clientServer = new ClientServer(cb);
    }

}

function onError(err) {
    this.requests.clear();
    this.clientServer = null;
    throw err;
}

function onOpen() {
    console.log('Connected to the server');
}

function onMessage(event) {
    if (event.data instanceof String) {
        let str = event.data;
        console.log(event.data);
    } else if (event.data instanceof ArrayBuffer) {
        let buffer = event.data;
        let str = ab2str(buffer);
        //此处解析消息，判断是请求还是应答，若是请求则构建request和response，则调用ClientServer的emit request函数
        //若是应答则根据id找到对应client request 然后在通过request的onMessage函数给发送消息
        let httpStruct = httpParse(str);
        let id = httpStruct.headers.get('request-id');
        if(isResponse(httpStruct.firstLine))
        {
            let req = this.requests.get(Number.parseInt(id));
            if(req)
            {
                let response = new Response(this.ws, {headers: {'request-id': id}});
                req.onResponse(httpStruct.content, response);
                // this.requests.delete(this.requestId);
            }
        } else {
            let obj = parseFirstLine(httpStruct.firstLine);
            let options = {path: obj.path, method: obj.method, headers: httpStruct.headers};
            let request = new Request(options);
            let response = new Response(this.ws, {headers: {'request-id': id}});
            this.clientServer.emit('request', request, response);
        }
    }
}

function parseFirstLine(firstLine) {
    let method = firstLine.substring(0, firstLine.indexOf(' '));
    let path = firstLine.substring(firstLine.indexOf(' ') + 1, firstLine.lastIndexOf(' '));
    return {method: method, path: path};
}

function isResponse(firstLine) {
    if(firstLine.toUpperCase().startsWith('HTTP'))
    {
        return true;
    }
    else {
        return false;
    }
}

function onClose(event) {
    let code = event.code;
    let reason = event.reason;
    let wasClean = event.wasClean;
    let str;
    if (wasClean) {
        str = "Connection closed normally.";
    }
    else {
        str = "Connection closed with message " + reason +
            "(Code: " + code + ")";
    }
    this.requests.clear();
    this.clientServer = null;
    console.log(str);
}

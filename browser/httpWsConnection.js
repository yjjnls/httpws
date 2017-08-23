
class HttpWsConnection {
    constructor(options) {
        if (typeof options === 'string')
        {
            this.ws = new WebSocket(options);
        }
        else if(options.hostname && options.port)
        {
            let path = options.path || '/';
            this.ws = new WebSocket(`ws://${options.hostname}:${options.port}${path}`);
            if(this.ws) {
                this.ws.binaryType = "arraybuffer";

                this.ws.onerror = onError.bind(this);

                this.ws.onopen = onOpen.bind(this);

                this.ws.onmessage = onMessage.bind(this);

                this.ws.onclose = onClose.bind(this);
            }
            this.path = path.substring(1) || '';
        }
        else {
            throw new Error('Unable to connect to the domain name');
        }
        this.requests = new Map();
        this.service = null;
        this.onConnected = null;
    }

    _addRequest(requestId, request) {
        this.requests.set(requestId, request);
    }

    createClientRequest(options, cb) {
        let req = new Request(options);
        let clientRequest = new ClientRequest(this.ws, req, cb);
        req.headers.set('CSeq',clientRequest.getRequestId());
        this.requestId = clientRequest.getRequestId();
        this._addRequest(clientRequest.getRequestId(), clientRequest);
        return clientRequest;
    }

    addServiceListener(cb) {
        if(this.service) {
            this.service.addRequestListener(cb);
        } else {
            console.log('Client service has not been created!');
        }
    }

    removeServiceListener(cb) {
        this.service.removeRequestListener(cb);
    }

    close() {
        if(this.ws) {
            this.ws.close();
        }
        this.requests.clear();
        this.service = null;
        this.onConnected = null;
    }

}

function onError(err) {
    this.requests.clear();
    this.service = null;
    throw err;
}

function onOpen() {
    console.log('Connected to the server');
    this.service = new ClientService();
    if(this.onConnected) {
        this.onConnected();
    }
}

function onMessage(event) {
    let str;
    if (typeof event.data === 'string') {
        str = event.data;
        //console.log('onMessage:\r\n' + event.data);
    } else if (event.data instanceof ArrayBuffer) {
        let buffer = event.data;
        str = ab2str(buffer);
    }
    //此处解析消息，判断是请求还是应答，若是请求则构建request和response，则调用ClientServer的emit request函数
    //若是应答则根据id找到对应client request 然后在通过request的onMessage函数给发送消息
    let httpStruct = httpParse(str);
    let id = httpStruct.headers.get('CSeq');
    if(isResponse(httpStruct.firstLine))
    {
        let req = this.requests.get(Number.parseInt(id));
        if(req)
        {
            let response = new Response(this.ws, {headers: {'CSeq': id}});
            req.onResponse(httpStruct.content, response);
            // this.requests.delete(this.requestId);
        }
    } else if(isRequest(httpStruct.firstLine) && this.service){
        let obj = parseFirstLine(httpStruct.firstLine);
        let options = {path: obj.path, method: obj.method, headers: httpStruct.headers};
        let request = new Request(options);
        request.addBody(httpStruct.content);
        let response = new Response(this.ws, {headers: {'CSeq': id}});
        this.service.emit('request', request, response);
    } else {
        console.error(new Error(str));
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
    this.service = null;
    this.onConnected = null;
    console.log(str);
}

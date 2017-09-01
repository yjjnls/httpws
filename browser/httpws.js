

function line_parse( content ){
    
    if( typeof content == 'string' ){
        n = content.indexOf('\r\n');
        if( n == -1){
            return null;
        }
        return {
            line : content.slice(0,n),
            remain: content.slice(n+2)
        }
   
    } else {
        const crlf=Array('\r\n')

        n = content.indexOf(crlf);
        if( n == -1){
            return null;
        }
        return {
            line : content.slice(0,n).toString(),
            remain: content.slice(n+2)
        }
    }

}
class Connection  extends EventEmitter {
    /**
     * Create httpws connection 
     * 
     * @param {string} url 
     * @param {object} options options for the connection 
     * @param {function} options.onerror  A callback on the connection error occured
     *                                    onerror( reason ), reason is the json object
     * @param {function} options.onopen   A callback on the connection open successfuly     
     * @param {function} options.onclose  A callback on the connection closed
     * 
     */
    constructor( url, cb ){
        this.listen_callback = cb;
        this.connected = false;
        this.requests  = Map(); //client request,waiting for response
        this.chunk_requests = Map(); //chunk request (incoming request)
        this.url = url;
        this.log = log4javascript.getLogger('httpws');
        this.ws =new WebSocket(url);
        if ( ! this.ws ){
            log.error("failed to create connection ", url);
            return;
        }

        this.ws.binaryType = "arraybuffer";
        
        this.ws.onerror = this._onerror.bind(this);
        this.ws.onopen = this._onopen.bind(this);
        this.ws.onmessage = this._onmessage.bind(this);
        this.ws.onclose = this._onclose.bind(this);

    }

    /**
     * Create an request object
     * @param {*} options 
     * @param {*} cb 
     */
    request( options, cb){

    }

    /**
     * Service 
     * @param {*} cb 
     */
    listen( cb ){

    }

    //
    // inner function
    //


    _onerror(err) {
        this.emit('error',err);
        this.requests.clear();
        this.service = null;
        throw err;
    }
    
    _onopen() {
        this.log.debug("connection ",this.url,"success.");
    }

    _onclose() {
        this.log.debug("connection ",this.url,"close.");        
        this.emit('close',this);
    }

    _onmessage( event ){
        var ps = line_parse(event);
        if ( !ps ){
            log.warn('invalid incoming message:',ps);
            return;
        }

        fields = ps.line.split(' ');
        if( fields[0] == ':error' || fields == ':message'){
            var content = ps.remain;
            if( typeof ps.remain != 'string'){
                content = ps.remain.toString();
            }

            var obj = JSON.parse(content);
            this.emit('error',obj);
            if ( fields[0] == ':error' ){
                this.log.error(content);
            } else {
                this._onMessage( obj );
                this.log.debug(content);
            }

        } else if ( fields[0] == ':message'){

        }
        else if ( fields[0] == ':request' | fields[0] == ':response' ){

            if( len(fields) < 2) {
                this.log.warn('ilegal message line:',ps.line);
                return;
            }
            var seqid = Number( fields[1]);

            var func = (fields[0] == ':request' ? _onRecvRequestMessage : _onRecvResponseMessage )

            func(seqid, ps.remain );

        } else {
            log.warn('unkown message line:', ps.line)
        }

    }

    _onRecvRequestMessage( seqId, payload  ){
        if( !this.listen_callback ){
            return;
        }

        var req = this.chunk_requests.get(seqId);
        if( !req ){
            req = incomingRequestParse( payload );
            var res = outgoingResponse( req );
            res._sequence_id = seqId;
            this.emit('request', req, res );
        }

        req.emit('data',req._chunk);
        req.emit('end');
    }

    _onRecvResponseMessage( seqId, payload, ){

        var req = this.chunk_requests.get(seqId);
        if( !req ){
            this.log.debug("recv illegal response message id=",seqId);
            return;
        }

        var data;

        req.emit('data',data);
        req.emit('end');
    }

    _onMessage( obj ){
        if( obj.type && obj.type == 'hostname' ){
            if( this.connected ){
                log.warn('recv hostname after connection established, ignore it');
                return;
            }
            this.hostname = obj.hostname;
            //this.service = new ClientService();
            this.emit('connection',this);    
        }

    }













    _constructor(options) {
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

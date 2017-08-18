function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {

        if (!body) {
            this._bodyText += '';
        } else if (typeof body === 'string') {
            this._bodyText += body;
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText += body.toString();
        } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            let buf = bufferClone(body.buffer);

            this._bodyArrayBuffer = bufferAdd(this._bodyArrayBuffer, buf);
            // IE 10-11 can't handle a DataView body.

        } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            let buf = bufferClone(body.buffer);

            this._bodyArrayBuffer = bufferAdd(this._bodyArrayBuffer, buf);
        } else {
            throw new Error('unsupported BodyInit type')
        }

        if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
                this.headers.set('content-type', 'text/plain;charset=UTF-8')
            } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set('content-type', this._bodyBlob.type)
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
            }
        }
    };

    this._resetBody = function () {
        this.bodyUsed = false;
        this._bodyText = '';
        this._bodyBlob = null;
        this._bodyFormData = null;
        this._bodyArrayBuffer = null;
    }

    if (support.blob) {
        this.blob = function() {
            let rejected = consumed(this)
            if (rejected) {
                return rejected
            }

            if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as blob')
            } else {
                return Promise.resolve(new Blob([this._bodyText]))
            }
        };

        this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
                return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
                return this.blob().then(readBlobAsArrayBuffer)
            }
        }
    }

    this.text = function() {
        let rejected = consumed(this);
        if (rejected) {
            return rejected;
        }

        if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob);
            // return readBlobAsText(this._bodyBlob);
        } else if (this._bodyArrayBuffer) {
            return readArrayBufferAsText(this._bodyArrayBuffer);
            // return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
        } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as text')
        } else {
            return this._bodyText;
            // return Promise.resolve(this._bodyText);
        }
    };

    if (support.formData) {
        this.formData = function() {
            return this.text().then(decode)
        }
    }

    this.json = function() {
        return this.text().then(JSON.parse)
    };

    return this
}

class Request extends EventEmitter {
    constructor(options) {
        super();

        options = options || {};

        if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers)
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.path = options.path || '/';

        this.resetBody();
    }


    addBody(body) {
        this._initBody(body);
    }

    constructHttpMessage() {
        let requestLine = `${this.method} ${this.path} HTTP/1.1\r\n`;
        let headersLines = '';
        for(let [key, value] of this.headers.entries())
        {
            headersLines += `${key}:${value}\r\n`;
        }
        return requestLine + headersLines + '\r\n' + this.text();
    }

    resetBody() {
        this._resetBody();
    }
}

Body.call(Request.prototype);

function decode(body) {
    let form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
        if (bytes) {
            let split = bytes.split('=')
            let name = split.shift().replace(/\+/g, ' ');
            let value = split.join('=').replace(/\+/g, ' ');
            form.append(decodeURIComponent(name), decodeURIComponent(value))
        }
    });
    return form
}

function parseHeaders(rawHeaders) {
    let headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
        let parts = line.split(':')
        let key = parts.shift().trim()
        if (key) {
            let value = parts.join(':').trim()
            headers.append(key, value)
        }
    });
    return headers
}


class Response extends EventEmitter {
    constructor(ws,options) {
        super();
        this.ws = ws || null;
        this.body = null;
        if (!options) {
            options = {}
        }
        this.type = 'default';
        this.status = 'status' in options ? options.status : 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this.resetBody();
    }

    addBody(body) {
        this._initBody(body);
    }

    setStatus(status, statusText) {
        this.status = status ? status : 200;
        this.statusText = statusText ? statusText : 'OK';
    }

    setHeader(key, value) {
        this.headers.set(key,value);
    }

    resetBody() {
        this._resetBody();
    }

    static errorResponse() {
        let response = new Response(null, {status: 0, statusText: ''});
        response.type = 'error';
        return response
    }

    write(data) {
        this.addBody(data);
    }

    end(data) {
        this.addBody(data);
        let response = this.constructHttpMessage();
        if (this.ws.readyState === WebSocket.OPEN){
            let buf = str2ab(response);
            let str = ab2str(buf);
            this.ws.send(buf);
            this.resetBody();
        }
        else
        {
            throw new Error('Socket not opened');
        }
    }

    constructHttpMessage() {
        let requestLine = `HTTP/1.1 ${this.status} ${this.statusText}\r\n`;
        let headersLines = '';
        for(let [key, value] of this.headers.entries())
        {
            headersLines += `${key}:${value}\r\n`;
        }
        return requestLine + headersLines + '\r\n' + this.text();
    }

    resetBody() {
        this._resetBody();
    }
}

Body.call(Response.prototype);

function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
        reader.onload = function() {
            resolve(reader.result)
        };
        reader.onerror = function() {
            reject(reader.error)
        }
    })
}

function readBlobAsArrayBuffer(blob) {
    let reader = new FileReader();
    let promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
}

function readBlobAsText(blob) {
    let reader = new FileReader();
    let promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
}

function readArrayBufferAsText(buf) {
    let view = new Uint8Array(buf);
    let chars = new Array(view.length);

    for (let i = 0; i < view.length; i++) {
        chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
}

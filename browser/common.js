




function uuid(len, radix) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
        // rfc4122, version 4 form
        let r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data. At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random()*16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

// ArrayBuffer转为字符串，参数为ArrayBuffer对象
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// 字符串转为ArrayBuffer对象，参数为字符串
function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 每个字符占用1个字节
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    addListener(label, callback) {
        this.listeners.has(label) || this.listeners.set(label, []);
        this.listeners.get(label).push(callback);
    }
    removeListener(label, callback) {
        let listeners = this.listeners.get(label);
        let index;
        if (listeners && listeners.length) {
            index = listeners.reduce((i, listener, index) => {
                return (typeof listener === "function" && listener === callback) ? i = index : i;
            }, -1);
        }
        if (index > -1) {

            listeners.splice(index, 1);
            this.listeners.set(label, listeners);
            return true;
        }

        return false;
    }

    on(label, callback) {
        this.addListener(label, callback);
    }

    emit(label, ...args) {
        let listeners = this.listeners.get(label);
        if (listeners && listeners.length) {
            listeners.forEach((listener) => {
                listener(...args);
            });
            return true;
        }

        return false;
    }
}

// HTTP methods whose capitalization should be normalized
let methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

function normalizeMethod(method) {
    let upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
}

let support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
        try {
            new Blob();
            return true
        } catch(e) {
            return false
        }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
};

if (support.arrayBuffer) {
    var viewClasses = [
        '[object Int8Array]',
        '[object Uint8Array]',
        '[object Uint8ClampedArray]',
        '[object Int16Array]',
        '[object Uint16Array]',
        '[object Int32Array]',
        '[object Uint32Array]',
        '[object Float32Array]',
        '[object Float64Array]'
    ]

    var isDataView = function(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
    var iterator = {
        next: function() {
            var value = items.shift()
            return {done: value === undefined, value: value}
        }
    }

    if (support.iterable) {
        iterator[Symbol.iterator] = function() {
            return iterator
        }
    }

    return iterator
}

function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
        headers.forEach(function(value, name) {
            this.append(name, value)
        }, this)
    } else if (Array.isArray(headers)) {
        headers.forEach(function(header) {
            this.append(header[0], header[1])
        }, this)
    } else if (headers) {
        Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name])
        }, this)
    }
}

Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    let oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue+','+value : value
}

Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
}

Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
}

Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
}

Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
}

Headers.prototype.forEach = function(callback, thisArg) {
    for (let name in this.map) {
        if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this)
        }
    }
}

Headers.prototype.keys = function() {
    let items = [];
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
}

Headers.prototype.values = function() {
    let items = [];
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
}

Headers.prototype.entries = function() {
    let items = [];
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
}

if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
}

function consumed(body) {
    if (body.bodyUsed) {
        return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
}

function normalizeName(name) {
    if (typeof name !== 'string') {
        name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
        throw new TypeError('Invalid character in header field name')
    }
    return name;
    return name.toLowerCase();
}

function normalizeValue(value) {
    if (typeof  value === 'number') {
        return value;
    } else if (typeof value !== 'string') {
        value = String(value)
    }
    return value
}
function readArrayBufferAsText(buf) {
    let view = new Uint8Array(buf);
    let chars = new Array(view.length);

    for (let i = 0; i < view.length; i++) {
        chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
}

function bufferClone(buf) {
    if (buf.slice) {
        return buf.slice(0)
    } else {
        let view = new Uint8Array(buf.byteLength);
        view.set(new Uint8Array(buf));
        return view.buffer;
    }
}


function bufferAdd(buf1, buf2) {
    let bufView1 = new Uint8Array(buf1);
    let bufView2 = new Uint8Array(buf2);
    let sumView = [...bufView1, ...bufView2];
    return sumView.buffer;
}

function httpParse(message) {
    let firstLine = '';
    let headers = new Headers();
    let array = message.split(/\r\n?\r\n/);
    let content = array[1];
    for(line of array[0].split(/\r?\n/))
    {
        if(firstLine.length === 0) {
            firstLine = line;
        }
        if(line.indexOf(':') > 0) {
            let parts = line.split(':');
            let key = parts.shift().trim();
            if (key) {
                let value = parts.join(':').trim();
                headers.append(key, value)
            }
        }
    }
    return {firstLine, headers, content};
}

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
        if(this.method.toUpperCase() === 'GET')
        {
            return;
        }
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

    getHeaders() {
        let obj = {};
        for(let [key, value] of this.headers.entries()) {
            obj[key.toLowerCase()] = value;
        }
        return obj;
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
            this.ws.send(response);
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

function parseFirstLine(firstLine) {
    let method = firstLine.substring(0, firstLine.indexOf(' '));
    let path = firstLine.substring(firstLine.indexOf(' ') + 1, firstLine.lastIndexOf(' '));
    return {method: method, path: path};
}

function isResponse(firstLine) {
    if (firstLine.toUpperCase().startsWith('HTTP'))
    {
        return true;
    }
    else {
        return false;
    }
}

function isRequest(firstLine) {
    if (firstLine.toUpperCase().endsWith('HTTP/1.1') || firstLine.toUpperCase().endsWith('HTTP/1.0'))
    {
        return true;
    }
    else {
        return false;
    }
}

function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);if(str.indexOf('{')>-1) {
                return true;
            } else {
                return false;
            }
        } catch(e) {
            console.log(e.message);
            return false;
        }
    }
    return false;
}

function trim(str) {
    return str.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'');
}

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
  return name.toLowerCase()
}

function normalizeValue(value) {
  if (typeof value !== 'string') {
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
        let view = new Uint8Array(buf.byteLength)
        view.set(new Uint8Array(buf))
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
  content = array[1];
  for(line of array[0].split(/\r?\n/))
  {
    if(firstLine.length === 0) {
      firstLine = line;
    }
    if(line.indexOf(':') > 0) {
      let parts = line.split(':')
      let key = parts.shift().trim()
      if (key) {
        let value = parts.join(':').trim()
        headers.append(key, value)
      }
    }
  }
  return {firstLine, headers, content};
}

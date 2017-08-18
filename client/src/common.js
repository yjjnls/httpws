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

let isFunction = function (obj) {
    return typeof ojb === 'function' || false;
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
                return (isFunction(listener) && listener === callback) ? i = index : i;
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

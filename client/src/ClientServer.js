
class ClientServer extends EventEmitter {
    constructor(requestListener) {
        super();
        if (requestListener) {
            this.on('request', requestListener);
        }
    }
}

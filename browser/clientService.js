
class ClientService extends EventEmitter {
    constructor() {
        super();
    }

    addRequestListener(requestListener) {
        this.addListener('request', requestListener);
    }
}

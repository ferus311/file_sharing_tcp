const net = require('net');

class ConnectionManager {
    constructor() {
        this.client = new net.Socket();
        this.isConnected = false;
        this.queue = [];
        this.client.on('data', (data) => {
            if (this.currentResolve) {
                this.currentResolve(data.toString());
                this.currentResolve = null;
            }
            this.processQueue();
        });

        this.client.on('error', (err) => {
            if (this.currentReject) {
                this.currentReject(err);
                this.currentReject = null;
            }
            this.processQueue();
        });

        this.client.on('close', () => {
            this.isConnected = false;
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }
            this.client.connect(1234, '127.0.0.1', () => {
                this.isConnected = true;
                resolve();
            });

            this.client.on('error', (err) => {
                reject(err);
            });
        });
    }

    sendMessage(message) {
        return new Promise((resolve, reject) => {
            this.queue.push({ message, resolve, reject });
            if (this.queue.length === 1) {
                this.processQueue();
            }
        });
    }

    processQueue() {
        if (this.queue.length === 0) {
            return;
        }
        const { message, resolve, reject } = this.queue.shift();
        this.currentResolve = resolve;
        this.currentReject = reject;
        this.client.write(message);
    }

    close() {
        this.client.destroy();
        this.isConnected = false;
    }
}

module.exports = new ConnectionManager();

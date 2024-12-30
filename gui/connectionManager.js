const net = require('net');

const address = process.env.SERVER_ADDRESS || '127.0.0.1';
const port = process.env.SERVER_PORT || 1234;

class ConnectionManager {
    constructor() {
        this.client = new net.Socket();
        this.isConnected = false;
        this.isConnecting = false; // Trạng thái để kiểm tra xem có đang kết nối hay không
        this.queue = [];
        this.currentResolve = null;
        this.currentReject = null;

        // Lắng nghe sự kiện 'data' để xử lý dữ liệu nhận được
        this.client.on('data', (data) => {
            if (this.currentResolve) {
                this.currentResolve(data.toString());
                this.currentResolve = null;
            }
            this.processQueue();
        });

        // Lắng nghe sự kiện 'error' để xử lý lỗi
        this.client.on('error', (err) => {
            if (this.currentReject) {
                this.currentReject(err);
                this.currentReject = null;
            }
            this.processQueue();
        });

        // Lắng nghe sự kiện 'close' để cập nhật trạng thái kết nối
        this.client.on('close', () => {
            this.isConnected = false;
            this.isConnecting = false; // Đánh dấu kết nối không còn trong quá trình kết nối
        });
    }

    // Kết nối đến server
    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve(); // Nếu đã kết nối, trả về ngay lập tức
                return;
            }

            // Nếu đang kết nối, đợi cho kết nối hoàn thành
            if (this.isConnecting) {
                return; // Nếu đang kết nối, không thực hiện kết nối mới
            }

            this.isConnecting = true; // Đánh dấu là đang kết nối
            this.client.connect(port, address, () => {
                this.isConnected = true;
                this.isConnecting = false; // Kết nối thành công
                resolve();
            });

            // Xử lý lỗi nếu kết nối không thành công
            this.client.on('error', (err) => {
                this.isConnecting = false; // Đánh dấu kết nối không thành công
                reject(err);
            });
        });
    }

    // Gửi một thông điệp và trả về Promise
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            this.queue.push({ message, resolve, reject });

            // Nếu queue rỗng, bắt đầu xử lý ngay
            if (this.queue.length === 1) {
                this.processQueue();
            }
        });
    }

    // Xử lý queue, gửi các thông điệp chưa xử lý
    processQueue() {
        if (this.queue.length === 0 || !this.isConnected) {
            return;
        }

        const { message, resolve, reject } = this.queue.shift();

        // Gán các hàm resolve và reject hiện tại
        this.currentResolve = resolve;
        this.currentReject = reject;

        // Gửi message qua socket
        this.client.write(message, (err) => {
            if (err) {
                // Nếu có lỗi khi gửi, reject promise
                this.currentReject(err);
                this.currentResolve = null;
                this.currentReject = null;
                this.processQueue(); // Tiếp tục xử lý các request còn lại
            }
        });
    }

    // Đóng kết nối
    close() {
        this.client.destroy();
        this.isConnected = false;
    }
}

module.exports = new ConnectionManager();

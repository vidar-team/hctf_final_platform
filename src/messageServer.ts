import * as http from "http";
import * as redis from "redis";
import * as socketio from "socket.io";

// tslint:disable-next-line:no-empty
const httpServer = http.createServer((req, res) => {

});

httpServer.listen(4000);

const redisClient = redis.createClient();
const socketServer = socketio(httpServer);

redisClient.subscribe("message");

socketServer.on("connection", (socket) => {
    const ADMIN_KEY = "mDktXt32gPdO9C*4G%JO*nMi^9C7$mzR";
    redisClient.subscribe("public");
    redisClient.subscribe("admin");
    let isAdmin = false;
    if (socket.handshake.query && socket.handshake.query.key === ADMIN_KEY) {
        // is admin
        isAdmin = true;
    }

    redisClient.on("message", (channel, message) => {
        if (channel === "admin") {
            if (isAdmin) {
                socket.emit("message", message);
            }
        } else {
            socket.emit("message", message);
        }
    });

});

// socketServer.on("disconnect", (socket) => {
//     console.log("disconnected");
// });

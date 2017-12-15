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

    redisClient.on("message", (channel, message) => {
        socket.emit("message", message);
    });

});

// socketServer.on("disconnect", (socket) => {
//     console.log("disconnected");
// });

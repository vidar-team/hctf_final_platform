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
    redisClient.on("message", (error, message) => {
        socket.emit("message", message);
    });
});

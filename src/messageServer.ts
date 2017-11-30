import * as http from "http";
import * as redis from "redis";
import * as socketio from "socket.io";

// tslint:disable-next-line:no-empty
const httpServer = http.createServer((req, res) => {

});

httpServer.listen(4000);

const redisClient = redis.createClient();
const socketServer = socketio(httpServer);
socketServer.on("connection", (socket) => {
    redisClient.subscribe("message", () => {
        redisClient.on("message", (error, message) => {
            socket.broadcast.emit("message", message);
        });
    });
});

import * as redis from "redis";

export enum LogLevel {
    "ERROR",
    "WARNING",
    "INFO",
    "DEBUG",
}

class Logger {
    public static info(type: string, data: {[key: string]: any}) {
        return new Logger().log(LogLevel.INFO, type, data);
    }
    public redisClient: redis.RedisClient;

    constructor() {
        this.redisClient = redis.createClient();
    }

    public log(level: LogLevel, type: string, data: {[key: string]: any}) {
        this.redisClient.publish("message", JSON.stringify({
            type,
            level,
            data,
        }));
    }
}

export default Logger;

import * as redis from "redis";

export enum LogLevel {
    "ERROR",
    "WARNING",
    "INFO",
    "DEBUG",
}

class Logger {
    public static error(type: string, channel: string = "public", data: {[key: string]: any}) {
        return new Logger().log(LogLevel.ERROR, type, channel, data);
    }
    public static warning(type: string, channel: string = "public", data: {[key: string]: any}) {
        return new Logger().log(LogLevel.WARNING, type, channel, data);
    }
    public static info(type: string, channel: string = "public", data: {[key: string]: any}) {
        return new Logger().log(LogLevel.INFO, type, channel, data);
    }
    public static debug(type: string, channel: string = "public", data: {[key: string]: any}) {
        return new Logger().log(LogLevel.DEBUG, type, channel, data);
    }
    public redisClient: redis.RedisClient;

    constructor() {
        this.redisClient = redis.createClient();
    }

    public log(level: LogLevel, type: string, channel: string = "public", data: {[key: string]: any}) {
        this.redisClient.set(`log:${channel}:${new Date().valueOf().toString()}`, JSON.stringify({
            type,
            level,
            data,
        }), () => {
            this.redisClient.publish(channel, JSON.stringify({
                type,
                level,
                data,
                time: new Date().toISOString(),
            }), () => {
                this.redisClient.quit();
            });
        });
        console.log(channel, data);
    }
}

export default Logger;

import * as redis from "redis";

export default class BaseController {
    public redisClient: redis.RedisClient;

    constructor() {
        console.log(1);
        this.redisClient = redis.createClient();
    }
}

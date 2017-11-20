import * as redis from "redis";

export default class BaseController {
    public redisClient: redis.RedisClient;

    constructor() {
        this.redisClient = redis.createClient();
    }
}

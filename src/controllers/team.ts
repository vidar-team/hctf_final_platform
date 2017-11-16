import { Request, Response } from "express";
import * as redis from "redis";

export class Team {
    private redisClient: redis.RedisClient;

    constructor() {
        this.redisClient = redis.createClient();
    }

    public register(request: Request, response: Response) {
        response.json({
            status: "ok",
        });
    }

}

export default new Team();

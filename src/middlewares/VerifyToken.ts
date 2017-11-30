import { NextFunction, Request, Response } from "express";
import * as redis from "redis";
import APIResponse from "../responses/APIResponse";

export default function verifyToken(request: Request, response: Response, next: NextFunction): Response {
    if (!request.query.token && !request.body.token) {
        return response.status(403).json(APIResponse.error("need_token", "需要队伍 Token 以操作"));
    } else {
       const clientToken = request.query.token || request.body.token;
       const redisClient = redis.createClient();
       redisClient.hget("token.teamname.mapping", clientToken, (error, result) => {
           if (result === null) {
                return response.status(404).json(APIResponse.error("bad_token", "Token 不合法"));
           } else {
               request.body.teamName = result;
               next();
           }
       });
    }
}

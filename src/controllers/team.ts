import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Request, Response } from "express";
import * as redis from "redis";
import APIResponse from "../responses/APIResponse";

export class Team {
    public redisClient: redis.RedisClient;

    constructor() {
        this.redisClient = redis.createClient();
    }
    /**
     * 注册用户
     * @param request
     * @param response
     */
    public register(request: Request, response: Response): Response {
        // Form Validation
        if (!request.body.name || !request.body.password) {
            return response.status(400).json(APIResponse.error("missing_parameters", "缺少必要参数"));
        }
        if (request.body.name.length > 30 || request.body.password.length > 128) {
            return response.status(400).json(APIResponse.error("invalid_parameters", "参数不合法"));
        }
        this.redisClient.hget("name.team.mapping", request.body.name, (hgetError, result) => {
            if (result !== null) {
                return response.status(403).json(APIResponse.error("duplicated_name", "队伍名已经注册"));
            } else {
                this.redisClient.incr("teams:count", (incrError, teamId) => {
                    this.redisClient.hmset(`team:${teamId}`, {
                        name: request.body.name,
                        password: bcrypt.hashSync(request.body.password),
                        token: crypto.randomBytes(20).toString("hex"),
                    }, () => {
                        this.redisClient.hset("name.team.mapping", request.body.name, teamId.toString());
                        return response.json({
                            status: "ok",
                        });
                    });
                });
            }
        });
    }
    /**
     * 登录
     * @param request
     * @param response
     */
    public login(request: Request, response: Response): Response {
        // Form Validation
        if (!request.body.name || !request.body.password) {
            return response.status(400).json(APIResponse.error("missing_parameters", "缺少必要参数"));
        }
        if (request.body.name.length > 30 || request.body.password.length > 128) {
            return response.status(400).json(APIResponse.error("invalid_parameters", "参数不合法"));
        }
        this.redisClient.hget("name.team.mapping", request.body.name, (hgetError, teamId) => {
            if (teamId === null) {
                return response.status(404).json(APIResponse.error("team_not_found", "队伍不存在"));
            }
            this.redisClient.hgetall(`team:${teamId}`, (hmgetError, team) => {
                if (!bcrypt.compareSync(request.body.password, team.password)) {
                    return response.status(403).json(APIResponse.error("unmatched_credentials", "队伍名密码不匹配"));
                } else {
                    delete team.password;
                    return response.json(APIResponse.success(team));
                }
            });
        });
    }
}

export default new Team();

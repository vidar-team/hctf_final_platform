import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Request, Response } from "express";
import APIResponse from "../responses/APIResponse";
import Logger from "../services/Logger";
import BaseController from "./BaseController";

export class Team extends BaseController {
    constructor() {
        super();
    }

    public list(request: Request, response: Response): void {
        this.redisClient.scan("0", "MATCH", "team:*", "COUNT", "10000", async (error, result) => {
            const teams = [];

            for (const teamKey of result[1]) {
                const info = await this.getTeamInfo(teamKey);
                delete info.password;
                delete info.token;
                teams.push(info);
            }

            return response.json(teams.sort((a, b) => {
                return b.score - a.score;
            }));
        });
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
                    const token = crypto.randomBytes(20).toString("hex");
                    this.redisClient.hmset(`team:${teamId}`, {
                        name: request.body.name,
                        password: bcrypt.hashSync(request.body.password),
                        token,
                    }, () => {
                        this.redisClient.hset("name.team.mapping", request.body.name, teamId.toString(), () => {
                            this.redisClient.hset("token.teamname.mapping", token, request.body.name, () => {
                                return response.json({
                                    status: "ok",
                                });
                            });
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

    /**
     * 增加分数
     * @param request
     * @param response
     */
    public increaseTeamScore(request: Request, response: Response): void {
        if (!request.body.teamName || !request.body.inc) {
            response.status(400).json(APIResponse.error("missing_parameters", "缺少必要参数"));
            return;
        }
        this.redisClient.hget("name.team.mapping", request.body.teamName, (hgetError, teamId) => {
            if (!teamId) {
                response.status(404).json(APIResponse.error("team_not_found", "队伍不存在"));
            } else {
                Logger.info("team:score", "public", {
                    teamName: request.body.teamName,
                    inc: request.body.inc,
                    time: new Date().toISOString(),
                });
                this.redisClient.hgetall(`team:${teamId}`, (hgetallError, teamInfo) => {
                    const score = parseInt(teamInfo.score, 10) + parseInt(request.body.inc, 10);
                    this.redisClient.hmset(`team:${teamId}`, "score", score.toString(), (hmsetError) => {
                        response.json(APIResponse.success({}));
                    });
                });
            }
        });
    }

    /**
     * 获得队伍信息
     * @param teamId 队伍 ID
     */
    private getTeamInfo(key: string): Promise<{ [key: string]: string }> {
        return new Promise((resolve, reject) => {
            this.redisClient.hgetall(key, (error, teamInfo) => {
                resolve(teamInfo);
            });
        });
    }
}

export default new Team();

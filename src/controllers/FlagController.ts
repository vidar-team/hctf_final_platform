import { Request, Response} from "express";
import APIResponse from "../responses/APIResponse";
import Logger from "../services/Logger";
import BaseController from "./BaseController";

export class Flag extends BaseController {
    constructor() {
        super();
    }
    /**
     * 提交 Flag
     * @param request
     * @param response
     */
    public submit(request: Request, response: Response): void {
        const teamName = request.body.teamName;
        const flag = request.query.flag || request.body.flag;
        if (!flag) {
            response.status(400).json(APIResponse.error("missing_parameters", "缺少参数"));
        } else {
            this.redisClient.hgetall(`flag:${flag}`, (error, result) => {
                if (result === null) {
                    Logger.debug("flag:submit", "admin", {
                        teamName,
                        status: "incorrect",
                    });
                    response.status(404).json(APIResponse.error("flag_not_found", "Flag 不存在"));
                } else {
                    const nowTime = new Date();
                    // tslint:disable-next-line:max-line-length
                    if (nowTime.valueOf() < new Date(result.validFrom).valueOf() || nowTime.valueOf() > new Date(result.validUntil).valueOf()) {
                        Logger.debug("flag:submit", "admin", {
                            teamName,
                            status: "expired",
                        });
                        response.status(404).json(APIResponse.error("flag_not_found", "Flag 不存在"));
                    } else {
                        // 成功提交 Flag
                        // 查重
                        this.redisClient.hgetall(`log:flag:submit:${teamName}-${flag}`, (hmgetError, flagSubmitLog) => {
                            if (flagSubmitLog !== null) {
                                Logger.debug("flag:submit", "admin", {
                                    teamName,
                                    status: "duplicated",
                                });
                                response.status(403).json(APIResponse.error("duplicated_flag", "Flag 已经提交过"));
                            } else {
                                this.redisClient.hmset(`log:flag:submit:${teamName}-${flag}`, {
                                    time: new Date().toISOString(),
                                });
                                Logger.info("flag:submit", "admin", {
                                    teamName,
                                    challengeName: result.challengeName,
                                    target: result.teamName,
                                    status: "correct",
                                });
                                // 加分
                                this.increaseTeamScore(teamName, 20);
                                this.increaseTeamScore(result.teamName, -20);
                                response.json(APIResponse.success(result));
                            }
                        });
                    }
                }
            });
        }
    }
    /**
     * 增加分数
     * @param teamName 队伍名
     * @param inc 增加分数
     */
    private increaseTeamScore(teamName: string, inc: number): Promise<{}> {
        return new Promise((resolve, reject) => {
            Logger.info("team:score", "public", {
                teamName,
                inc,
                time: new Date().toISOString(),
            });
            this.redisClient.hget("name.team.mapping", teamName, (hgetError, teamId) => {
                this.redisClient.hgetall(`team:${teamId}`, (hgetallError, teamInfo) => {
                    const score = parseInt(teamInfo.score, 10) + inc;
                    this.redisClient.hmset(`team:${teamId}`, "score", score.toString(), (hmsetError) => {
                        resolve();
                    });
                });
            });
        });
    }
}

export default new Flag();

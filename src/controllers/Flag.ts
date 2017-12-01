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
                    console.log(2);
                    Logger.info("flag:submit", {
                        teamName,
                        flag,
                        status: "incorrect",
                    });
                    response.status(404).json(APIResponse.error("flag_not_found", "Flag 不存在"));
                } else {
                    const nowTime = new Date();
                    if (nowTime < new Date(result.validFrom) || nowTime > new Date(result.validTo)) {
                        response.status(404).json(APIResponse.error("flag_not_found", "Flag 不存在"));
                    } else {
                        // 成功提交 Flag
                        // 查重
                        this.redisClient.hmget(`log:flag:submit:${teamName}-${flag}`, (hmgetError, flagSubmitLog) => {
                            if (flagSubmitLog !== null) {
                                response.status(403).json(APIResponse.error("duplicated_flag", "Flag 已经提交过"));
                            } else {
                                this.redisClient.hmset(`log:flag:submit:${teamName}-${flag}`, {
                                    time: new Date().toISOString(),
                                });
                            }
                        });
                        response.json(APIResponse.success(result));
                    }
                }
            });
        }
    }
}

export default new Flag();

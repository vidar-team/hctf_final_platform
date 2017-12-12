import { Request, Response } from "express";
import APIResponse from "../responses/APIResponse";
import BaseController from "./BaseController";

export class System extends BaseController {
    /**
     * 获得系统信息
     * @param request
     * @param response
     */
    public getSystemInfo(request: Request, response: Response): void {
        // calculate now round
        const startTime = new Date("2017-12-02 23:00:00"); // 比赛开始时间
        const endTime = new Date("2017-12-02 23:30:00"); // 比赛结束时间
        const flagRefreshInterval = 15 * 60 * 1000; // Flag 刷新间隔 毫秒
        const nowTime = new Date();
        const round = Math.floor((nowTime.valueOf() - startTime.valueOf()) / flagRefreshInterval) + 1;
        response.json(APIResponse.success({
            round,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        }));
    }
    /**
     * 获得公告日志
     * @param request
     * @param response
     */
    public getPublicLogs(request: Request, response: Response): void {
        this.redisClient.scan("0", "MATCH", "log:public:*", "COUNT", "10000", (error, result) => {
            if (result[1].length > 0) {
                this.redisClient.mget(result[1], (mgetError, logs) => {
                    response.json(APIResponse.success(logs.map((log) => {
                        return JSON.parse(log);
                    })));
                });
            } else  {
                response.json(APIResponse.success([]));
            }
        });
    }
    /**
     * 设定题目服务器状态
     * @param request
     * @param response
     */
    public setServerStatus(request: Request, response: Response): void {
        const teamName = request.body.teamName;
        const challengeName = request.body.challengeName;
        const status = request.body.status;
        if (!teamName || !challengeName || !status) {
            response.status(400).json(APIResponse.error("missing_parameters", "缺少必要参数"));
            return;
        }
        this.redisClient.set(`status:${teamName}:${challengeName}`, status, (error, result) => {
            response.json(APIResponse.success({}));
        });
    }
}

export default new System();

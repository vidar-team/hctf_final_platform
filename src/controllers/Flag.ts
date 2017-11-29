import { Request, Response} from "express";
import APIResponse from "../responses/APIResponse";
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
                    response.status(404).json(APIResponse.error("flag_not_found", "Flag 不存在"));
                } else {
                    const nowTime = new Date();
                    if (nowTime < new Date(result.validFrom) || nowTime > new Date(result.validTo)) {
                        response.status(404).json(APIResponse.error("flag_not_found", "Flag 不存在"));
                    } else {
                        response.json(APIResponse.success(result));
                    }
                }
            });
        }
    }
}

export default new Flag();

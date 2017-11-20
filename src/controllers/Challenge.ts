import * as bcrypt from "bcryptjs";
import { Request, Response } from "express";
import APIResponse from "../responses/APIResponse";
import BaseController from "./BaseController";

export class Challenge extends BaseController {
    constructor() {
        super();
    }
    /**
     * 列出全部 Challenge 名
     * @param request
     * @param response
     */
    public list(request: Request, response: Response): void {
        this.redisClient.llen("challenges", (llenerror, len) => {
            if (len === 0) {
                return response.status(404).json(APIResponse.error("empty_list", "问题列表为空"));
            } else {
                this.redisClient.lrange("challenges", 0, len, (lrangeError, challenges) => {
                    return response.json(APIResponse.success({
                        challenges,
                    }));
                });
            }
        });
    }
    /**
     * 加新 Challenge
     * @param request
     * @param response
     */
    public create(request: Request, response: Response): void {
        if (!request.body.name) {
            response.status(400).json(APIResponse.error("missing_parameters", "缺少必要参数"));
        }
        this.redisClient.rpush("challenges", request.body.name, (rpushError, len) => {
            response.json(APIResponse.success({
                len,
            }));
        });
    }
}

export default new Challenge();

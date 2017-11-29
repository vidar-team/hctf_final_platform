import { NextFunction, Request, Response } from "express";
import APIResponse from "../responses/APIResponse";

export default function verifyAdmin(request: Request, response: Response, next: NextFunction): Response {
    if (!request.query.token || !request.body.token) {
        next();
    } else {
        return response.status(403).json(APIResponse.error("need_token", "需要队伍 Token 以操作"));
    }
}

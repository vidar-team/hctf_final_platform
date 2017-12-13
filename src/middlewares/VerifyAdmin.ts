import { NextFunction, Request, Response } from "express";
import APIResponse from "../responses/APIResponse";

export default function verifyAdmin(request: Request, response: Response, next: NextFunction): Response {
    const adminToken = "mDktXt32gPdO9C*4G%JO*nMi^9C7$mzR";

    if (request.query.token === adminToken || request.body.token === adminToken) {
        next();
    } else {
        return response.status(403).json(APIResponse.error("permission_denied", "权限不足以执行此操作"));
    }
}

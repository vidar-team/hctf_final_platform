import { Request, Response} from "express";
import BaseController from "./BaseController";

export class Flag extends BaseController {
    constructor() {
        super();
    }

    public submit(request: Request, response: Response): void {

    }
}

export default new Flag();

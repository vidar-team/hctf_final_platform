import {Request, Response, Router} from "express";
import Team from "../controllers/team";

const router: Router = Router();

router.get("/", (request: Request, response: Response) => {
    response.send("Hello World");
});

router.post("/team/register", Team.register);

export default router;

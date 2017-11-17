import {Request, Response, Router} from "express";
import Team from "../controllers/Team";

const router: Router = Router();

router.get("/", (request: Request, response: Response) => {
    response.send("Hello World");
});

router.post("/team/register", Team.register.bind(Team));
router.post("/team/login", Team.login.bind(Team));

export default router;

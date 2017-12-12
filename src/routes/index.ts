import {Request, Response, Router} from "express";
import Challenge from "../controllers/ChallengeController";
import Flag from "../controllers/FlagController";
import System from "../controllers/SystemController";
import Team from "../controllers/TeamController";
import verifyAdmin from "../middlewares/VerifyAdmin";
import verifyToken from "../middlewares/VerifyToken";

const router: Router = Router();

router.get("/", (request: Request, response: Response) => {
    response.send("Hello World");
});

router.post("/Team/register", Team.register.bind(Team));
router.post("/Team/login", Team.login.bind(Team));
router.get("/Team/list", Team.list.bind(Team));
router.get("/Team/status", verifyToken, Team.getServerStatus.bind(Team));
router.post("/Team/incScore", verifyAdmin, Team.increaseTeamScore.bind(Team));
router.get("/Challenge/list", verifyAdmin, Challenge.list.bind(Challenge));
router.post("/Challenge/create", verifyAdmin, Challenge.create.bind(Challenge));
router.post("/Admin/index", verifyAdmin, (request: Request, response: Response) => {
    response.send("Admin Index");
});
router.post("/Flag/submit", verifyToken, Flag.submit.bind(Flag));
router.get("/System/info", System.getSystemInfo.bind(System));
router.get("/System/logs", System.getPublicLogs.bind(System));
router.post("/System/setServerStatus", System.setServerStatus.bind(System));

export default router;

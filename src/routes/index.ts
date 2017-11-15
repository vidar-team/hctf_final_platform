import {Router} from "express";
let router: Router = Router();

router.get("/", (request, response) => {
    response.send("Hello World");
});

export default router;
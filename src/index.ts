import * as bodyParser from "body-parser";
import * as express from "express";
import routes from "./routes";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(routes);

app.listen(3000, () => {
    console.log("Server listen at [::]:3000");
});

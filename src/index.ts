import * as express from "express";
import routes from './routes';

let app = express();

app.use(routes);

app.listen(3000, () => {
    console.log("Server listen at ::3000");
});
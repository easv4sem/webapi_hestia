import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import cookieParser from 'cookie-parser';
import Logger from "./Infrastructure/Logger/logger.js";
import {deviceRoutes} from "./Routes/deviceRoutes.js";
import {analyticsRoutes} from "./Routes/analyticsRoutes.js";
import {sensorRoutes} from "./Routes/sensorRoutes.js";
import {userRouter} from "./Routes/userRoutes.js";
import {notificationRoutes} from "./Routes/notificationRoutes.js";
import {sensorReadingRoutes} from "./Routes/sensorReadingRoutes.js";
import {AuthorizationHandler} from "./Handlers/AuthorizationHandler.js";
import {ERoles} from "./Entities/Enums/ERoles.js";


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log("Incoming cookies:", req.cookies);
    next();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        Logger.warn("Malformed JSON in request body : " + req + "/n" + "Error:" + err);
        return res.status(400).json({ error: 'Malformed JSON in request body' });
    }
    next(err);
});

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    Logger.info(`Request received: ${req.method} ${req.url}`, req);
    next();
});

const authorizationHandler = new AuthorizationHandler(ERoles.USER);
app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isApiRoute = req.path.startsWith("/api");
    const isPublicRoute = req.path.startsWith("/api/user/login") || req.path.startsWith("/api/user/register") || req.path.startsWith("/api/user/logout");

    if (isApiRoute && !isPublicRoute) {
        console.log("Authorization check for path: " + req.path);

        const result = await authorizationHandler.handle(req, res);

        if (!res.headersSent) {
            return next();
        }

        return;
    }

    return next();
});



app.use('/api/devices/', deviceRoutes);
app.use('/api/analytics/', analyticsRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/user', userRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sensorReadings', sensorReadingRoutes);
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    Logger.info("Request received: ${req.method} ${req.url}", req);
    next();
});

const server = app.listen(PORT, () =>{
    Logger.info("Server service has started on port: " + PORT);
})
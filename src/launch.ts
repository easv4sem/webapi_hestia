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

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        Logger.warn("Malformed JSON in request body");
        return res.status(400).json({ error: 'Malformed JSON in request body' });
    }
    next(err);
});

app.use(cookieParser());
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
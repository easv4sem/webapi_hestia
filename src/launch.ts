import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import cookieParser from 'cookie-parser';
import Logger from "./Infrastructure/Logger/logger.js";
import {deviceRoutes} from "./Routes/deviceRoutes.js";
import {analyticsRoutes} from "./Routes/analyticsRoutes.js";
import {sensorRoutes} from "./Routes/sensorRoutes.js";
import {userRouter} from "./Routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigin = "http://localhost:60008"; // Your Flutter Web URL

app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use('/api/devices/', deviceRoutes);
app.use('/api/analytics/', analyticsRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/user', userRouter);

const server = app.listen(PORT, () =>{
    Logger.info("Server service has started on port: " + PORT);
})
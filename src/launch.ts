import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import cookieParser from 'cookie-parser';
import Logger from "./Infrastructure/Logger/logger.js";
import {deviceRoutes} from "./Routes/deviceRoutes.js";
import {analyticsRoutes} from "./Routes/analyticsRoutes.js";
import {sensorRoutes} from "./Routes/sensorRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use('/api/devices/', deviceRoutes);
app.use('/api/analytics/', analyticsRoutes);
app.use('/api/sensors', sensorRoutes);

const server = app.listen(PORT, () =>{
    Logger.info("Server service has started on port: " + PORT);
})
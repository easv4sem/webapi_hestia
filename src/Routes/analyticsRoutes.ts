import express from "express";
import {AnalyticsController} from "../Controller/analyticsController.js";

const analyticsRoutes = express.Router();
const analyticsController = new AnalyticsController();

analyticsRoutes.post("/", (req, res) => analyticsController.calculateRequest(req, res));

export { analyticsRoutes };
import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { TrendingTopics } from "../controllers/trendingTopics.js";

const router = express.Router();

router.route("/trending").get(isAuthenticated,TrendingTopics);

export default router;
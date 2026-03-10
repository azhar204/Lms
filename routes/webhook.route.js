import express from "express";
import { shareCourseWebhook, sendChat, shareReviewWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/share-course-webhook", shareCourseWebhook);
router.post("/chat/send", sendChat);
router.post("/share-review-webhook", shareReviewWebhook);

export default router;
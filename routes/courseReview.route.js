import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourseReview,  getCourseReviews, getMyCourseReview} from "../controllers/courseReview.js";

const router = express.Router()

router.route("/:courseId").get(isAuthenticated,getCourseReviews)
router.route("/:courseId").post(isAuthenticated,createCourseReview)
router.route("/:courseId/my").get(isAuthenticated,getMyCourseReview)




export default router;



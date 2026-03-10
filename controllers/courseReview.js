import { CourseProgress } from "../models/courseProgress.js";
import { CourseReview } from "../models/courseReview.js";


export const createCourseReview = async (req, res) => {
  const userId = req.id;
  const { courseId, rating, comment } = req.body;

  const progress = await CourseProgress.findOne({ userId, courseId, completed: true });
  if (!progress) {
    return res.status(400).json({ message: "You must complete the course to leave a review." });
  }

  const alreadyReviewed = await CourseReview.findOne({ userId, courseId });
  if (alreadyReviewed) {
    return res.status(400).json({ message: "You have already reviewed this course." });
  }

  const review = await CourseReview.create({
    userId,
    courseId,
    rating,
    comment,
  });

  res.status(201).json({
    message: "Review submitted successfully.",
    review,
  });
};

export const getCourseReviews = async (req, res) => {
  const { courseId } = req.params;

  const reviews = await CourseReview.find({ courseId }).populate({ path: "userId",select: "name email photoUrl", }).sort({ createdAt: -1 });

  res.json({ reviews });
};

export const getMyCourseReview = async (req, res) => {
  const userId = req.id;
  const { courseId } = req.params;

  const review = await CourseReview.findOne({ courseId, userId });

  if (!review) {
    return res.status(404).json({ message: "No review found." });
  }

  res.json({ review });
};


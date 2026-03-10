import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-progress/${courseId}`, 
      cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["PK"], 
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.log(error);
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";


      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

    
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator", select: "name" })
      .populate({ path: "lectures", select: "lectureTitle videoUrl isPreviewFree" });

    const purchased = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

 
    const filteredLectures = course.lectures.map(lecture => {
      const lectureObj = lecture.toObject();
      if (!purchased && !lecture.isPreviewFree) {
        delete lectureObj.videoUrl; 
      }
      return lectureObj;
    });

    return res.status(200).json({
      course: {
        ...course.toObject(),
        lectures: filteredLectures,
      },
      purchased: purchased?.status || null,
    });
  } catch (error) {
    console.error("Error fetching course details:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const getAllPurchasedCourse = async (req, res) => {
  try {
    const instructorId = req.id; 

    
    const purchasedCourses = await CoursePurchase.find({
      status: "completed",
    })
      .populate({
        path: "courseId",
        match: { creator: instructorId }, 
        select: "courseTitle coursePrice creator", 
      })
      .populate("userId", "name email") 
      .exec();

    const filteredPurchases = purchasedCourses.filter(p => p.courseId !== null);

    if (filteredPurchases.length === 0) {
      return res.status(200).json({
        purchasedCourses: [],
        message: "No completed purchases found for your courses",
      });
    }

    return res.status(200).json({
      purchasedCourses: filteredPurchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch purchased courses",
      error: error.message,
    });
  }
};

export const getStudentProgress =async (req, res) => {
  try {
    const instructorId = req.id;

    
    const purchases = await CoursePurchase.find({ status: "completed" })
      .populate({
        path: "courseId",
        match: { creator: instructorId },
        select: "courseTitle _id lectures",
        populate: { path: "lectures", select: "_id" },
      })
      .populate("userId", "name email")
      .exec();


    const validPurchases = purchases.filter((p) => p.courseId !== null);


    const studentProgress = await Promise.all(
      validPurchases.map(async (purchase) => {
        const progress = await CourseProgress.findOne({
          userId: purchase.userId._id,
          courseId: purchase.courseId._id,
        });
        return {
          userId: {
            _id: purchase.userId._id,
            name: purchase.userId.name,
            email: purchase.userId.email,
          },
          courseId: {
            _id: purchase.courseId._id,
            courseTitle: purchase.courseId.courseTitle,
          },
          completedLectures: progress
            ? Math.min(
            progress.lectureProgress.filter((lp) => lp.viewed).length,
            purchase.courseId.lectures?.length || 0
          )
        : 0,
          totalLectures: purchase.courseId.lectures?.length || 0,
        };
      })
    );

    if (studentProgress.length === 0) {
      return res.status(200).json({
        studentProgress: [],
        message: "No student progress found for your courses",
      });
    }

    res.json({ studentProgress });
  } catch (error) {
    console.error("Error fetching student progress:", error.message);
    res.status(500).json({ error: "Failed to fetch student progress" });
  }
}
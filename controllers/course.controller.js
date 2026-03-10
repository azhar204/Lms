import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";

import {
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
  uploadMedia,
} from "../utils/cloudinary.js";
import axios from "axios";
export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category is required.",
      });
    }
    const instructor = await User.findById(req.id);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    if (instructor.isBlocked) {
      return res.status(403).json({ message: "You are blocked By Admin for creating courses." });
    }
    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(201).json({
      course,
      message: "Course created.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};

export const searchCourse = async (req, res) => {
  try {
    const { query = "", categories = "", sortByPrice = "" } = req.query;
    const categoriesArray = categories ? categories.split(",") : [];
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subTitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    if (categoriesArray.length > 0) {
      const regexCategories = categoriesArray.map(
        (cat) => new RegExp(`^${cat}$`, "i")
      );
      searchCriteria.category = { $in: regexCategories };
    }

    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1;
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1;
    }

    let courses = await Course.find(searchCriteria).sort(sortOptions).populate("creator", "name email");

    return res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.log(error);
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });
    if (!courses) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published courses",
    });
  }
};
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};
export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    let courseThumbnail;
    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      courseThumbnail = await uploadMedia(thumbnail.buffer);
    }

    const updateData = {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      courseThumbnail: courseThumbnail?.secure_url,
    };

    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
      course,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: "reviews",
      populate: { path: "userId", select: "name photoUrl" },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course by id",
    });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required",
      });
    }

    const lecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(201).json({
      lecture,
      message: "Lecture created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};
export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;

    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit lectures",
    });
  }
};
export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }

    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    );

    return res.status(200).json({
      message: "Lecture removed successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture",
    });
  }
};
export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!",
      });
    }
    return res.status(200).json({
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by id",
    });
  }
};

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;

    const course = await Course.findById(courseId).populate("enrolledStudents");
    console.log(course);

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    
    if (publish === "false" && course.enrolledStudents.length > 0) {
      return res.status(400).json({
        message:
          "Cannot unpublish. Students are already enrolled in this course.",
      });
    }

    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";

    
    if (course.isPublished) {
      const users = await User.find({}, "email");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

  
      const emailPromises = users.map((user) =>
        transporter.sendMail({
          from: `"Smart Learning" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `New Course Published: ${course.courseTitle}`,
          html: `
  
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9;">
              <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
               <h2 style="color: #2c3e50;">New Course Published! </h2>
              </div>
              <div style="padding: 20px; text-align: left;"> 
              <img src="${course.courseThumbnail}" alt="Course Thumbnail" 
               style="max-width: 100%; border-radius: 8px; margin-bottom: 15px;" />
               <h3 style="color: #2c3e50; margin: 0;">${course.courseTitle}</h3>
             <p style="color: #555; font-size: 15px; margin: 5px 0;">${
             course.description
            }</p>
            <p style="color: #555; font-size: 15px; margin: 5px 0;">Rs ${
            course.coursePrice
            }</p>
            </div>
            <div style="text-align: center; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #aaa;">
            &copy; ${new Date().getFullYear()} Smart Learning. All rights reserved.
            </div>
         </div>

          `
        })
      );
      await Promise.all(emailPromises);
    }

    return res.status(200).json({
      message: `Course is ${statusMessage}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update status" });
  }
};

export const createLiveLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title and course ID are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.creator.toString() !== req.id) {
      return res
        .status(403)
        .json({ message: "Only the course creator can add lectures" });
    }

    const zenstreamResponse = await axios.post(
      `${process.env.ZENSTREAM_API_URL}/livestream`,
      {
        title: lectureTitle,
        chatType: "anonymous",
      },
      {
        headers: {
          Authorization: `Apisecret ${process.env.ZENSTREAM_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("ZenStream API Response:", zenstreamResponse.data);

    const { streamId } = zenstreamResponse.data;
    let streamDetails = zenstreamResponse.data;

    let retries = 0;
    const maxRetries = 20;
    const pollingInterval = 5000;

    while (
      streamDetails.status !== "Ready to Start Broadcasting" &&
      retries < maxRetries
    ) {
      console.log(
        `Stream status: ${streamDetails.status}, retry: ${retries + 1}`
      );
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));

      try {
        const detailsResponse = await axios.get(
          `${process.env.ZENSTREAM_API_URL}/livestream/${streamId}`,
          {
            headers: {
              Authorization: `Apisecret ${process.env.ZENSTREAM_API_KEY}`,
            },
          }
        );
        streamDetails = detailsResponse.data;
      } catch (error) {
        console.error(
          "Error fetching stream details during polling:",
          error.message
        );
      }
      retries++;
    }

    if (streamDetails.status !== "Ready to Start Broadcasting") {
      const lecture = await Lecture.create({
        lectureTitle,
        isLive: true,
        streamId,
        streamUrl: null,
        joinUrl: `https://player.vdocipher.com/live-v2?liveId=${streamId}`,
        streamKey: null,
        startTime: new Date(),
      });

      course.lectures.push(lecture._id);
      await course.save();

      return res.status(201).json({
        lecture,
        message:
          "Live lecture created. The stream is still preparing and may take longer than expected.",
        streamStatus: streamDetails.status,
        streamId,
      });
    }

    let validatedStreamUrl = streamDetails.server;
    if (streamDetails.server && streamDetails.server.includes("rrtmp:")) {
      validatedStreamUrl = streamDetails.server.replace("rrtmp:", "rtmp:");
      console.warn("Fixed stream URL:", validatedStreamUrl);
    }

    const lecture = await Lecture.create({
      lectureTitle,
      isLive: true,
      streamId,
      streamUrl: validatedStreamUrl,
      joinUrl: `https://player.vdocipher.com/live-v2?liveId=${streamId}`,
      streamKey: streamDetails.serverKey,
      startTime: new Date(),
    });

    course.lectures.push(lecture._id);
    await course.save();

    return res.status(201).json({
      lecture,
      message: "Live lecture created successfully",
      streamStatus: streamDetails.status,
    });
  } catch (error) {
    console.error("Error creating live lecture:", {
      message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      apiEndpoint: `${process.env.ZENSTREAM_API_URL}/livestream`,
    });
    return res.status(500).json({
      message: "Failed to create live lecture",
      error: error.response?.data?.message || error.message,
    });
  }
};

export const endLiveLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);

    if (!lecture || !lecture.isLive) {
      return res
        .status(404)
        .json({ message: "Live lecture not found or already ended" });
    }

    const zenstreamResponse = await axios.patch(
      `${process.env.ZENSTREAM_API_URL}/livestream/${lecture.streamId}/end`,
      {},
      {
        headers: {
          Authorization: `Apisecret ${process.env.ZENSTREAM_API_KEY}`,
        },
      }
    );

    if (zenstreamResponse.status >= 200 && zenstreamResponse.status < 300) {
      const payload = JSON.stringify({ videoId: lecture.streamId });
      const encoded = Buffer.from(payload).toString("base64");
      const vdocipherUrl = `https://player.vdocipher.com/v2/?playbackInfo=${encoded}`;

      lecture.isLive = false;
      lecture.videoUrl = vdocipherUrl;
      await lecture.save();

      return res.status(200).json({
        message: "Live lecture ended successfully",
        streamId: lecture.streamId,
        videoUrl: vdocipherUrl,
      });
    } else {
      return res.status(zenstreamResponse.status).json({
        message: "Failed to end live lecture on streaming service",
        error:
          zenstreamResponse.data?.message ||
          `Status: ${zenstreamResponse.status}`,
      });
    }
  } catch (error) {
    console.error(
      "Error ending live lecture:",
      error.message,
      error.response?.data
    );
    return res.status(500).json({
      message: "An error occurred while trying to end the live lecture.",
      error: error.response?.data?.message || error.message,
    });
  }
};
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("lectures");
    if (!course) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    if (course.enrolledStudents && course.enrolledStudents.length > 0) {
      return res.status(400).json({
        message: "Cannot delete course. Students are already enrolled.",
      });
    }
    if (course.courseThumbnail) {
      const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }
    for (const lecture of course.lectures) {
      if (lecture.publicId) {
        await deleteVideoFromCloudinary(lecture.publicId);
      }
      await Lecture.findByIdAndDelete(lecture._id);
    }
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      message: "Course and related lectures deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to delete course",
    });
  }
};


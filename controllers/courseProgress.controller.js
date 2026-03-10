import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({
      courseId,
      userId,
    }).populate("courseId");

    const courseDetails = await Course.findById(courseId).populate("lectures");

    if (!courseDetails) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

  
    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
        },
      });
    }

  
    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;


    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

   
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
     
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

   
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);

    if (course.lectures.length === lectureProgressLength)
      courseProgress.completed = true;

    await courseProgress.save();

    return res.status(200).json({
      message: "Lecture progress updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress)
      return res.status(404).json({ message: "Course progress not found" });

    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = true)
    );
    courseProgress.completed = true;
    await courseProgress.save();
    return res.status(200).json({ message: "Course marked as completed." });
  } catch (error) {
    console.log(error);
  }
};

export const markAsInCompleted = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.id;
  
      const courseProgress = await CourseProgress.findOne({ courseId, userId });
      if (!courseProgress)
        return res.status(404).json({ message: "Course progress not found" });
  
      courseProgress.lectureProgress.map(
        (lectureProgress) => (lectureProgress.viewed = false)
      );
      courseProgress.completed = false;
      await courseProgress.save();
      return res.status(200).json({ message: "Course marked as incompleted." });
    } catch (error) {
      console.log(error);
    }
  };


export const getllInstructorAnalytics =async(req,res)=>{
  try {
    const instructors= await User.find({role:"instructor"})
    if(!instructors.length){
      return res.status(200).json({
        success:true,
        message:"No instructor present",
        data:[]
      })
    }
    const analytics =await Promise.all(
      instructors.map(async(instructor)=>{
        const course= await Course.find({creator:instructor._id}).populate(
          "enrolledStudents",
          "name email"
        );
        const courseData =course.map((course)=>(
          {
            courseId:course._id,
            title:course.courseTitle,
            totalEnrolled:course.enrolledStudents.length ||0,
            enrolledStudents: course.enrolledStudents?.map((s)=>({
              name:s.name,
              email:s.email
            }))
          }
        ))
        return {
          instructorId:instructor._id,
          name:instructor.name,
          email:instructor.email,
          totalCourses:course.length,
          courses:courseData,
          isBlocked: instructor.isBlocked,
        };
      
      })

    )
    return res.status(200).json({
      success:true,
      data:analytics,

    });
  } catch (error) {
   console.log("Error in getllInstructorAnalytics",error) 
   return res.status(500).json(
    {success:false,
      message:"failefd to get analytic"
    }
   )
  }
}


export const getAllStudentProgress = async(req,res)=>{
  try {
    const purchases = await CoursePurchase.find({status:"completed"})
    .populate({
      path:"courseId",
      select: "courseTitle _id lectures creator",
      populate: [
        { path: "lectures", select: "_id" },
        { path: "creator", select: "name email _id" }
      ],
    })
    .populate("userId", "name email")
    .exec();
    if(!purchases.length){
      return res.status(200).json({
        success:true,
        message:"No student progress found",
        data:[]
      })
    }
    
    const studentProgress = await Promise.all(
      purchases.map(async (purchase) => {
        if (!purchase.userId || !purchase.courseId) {
          return null;
        }
        const progress = await CourseProgress.findOne({
          userId: purchase.userId._id,
          courseId: purchase.courseId._id,
        });

        return {
          student: {
            _id: purchase.userId._id,
            name: purchase.userId.name,
            email: purchase.userId.email,
          },
          course: {
            _id: purchase.courseId._id,
            title: purchase.courseId.courseTitle,
          },
          instructor: purchase.courseId?.creator
            ? {
                _id: purchase.courseId.creator._id,
                name: purchase.courseId.creator.name,
                email: purchase.courseId.creator.email,
              }
            : null,
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
    
    const cleanedProgress = studentProgress.filter(Boolean);
    res.status(200).json({
      success: true,
      data: cleanedProgress,
    });
  } catch (error) {
    console.log("Error in  getAllStudentProgress",error)
    res.status(500).json(
      {
        success:false,
        message:"Failed to fetch student progress"
      }
    ) 
  }

}
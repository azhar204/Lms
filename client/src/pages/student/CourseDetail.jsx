import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import axios from "axios";
import { BadgeInfo, Loader, Lock, PlayCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const [reviews, setReviews] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const courseId = params.courseId;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8082/api/v1/reviews/${courseId}`,
          {
            withCredentials: true,
          }
        );
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };

    fetchReviews();
  }, [courseId]);

  const navigate = useNavigate();
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const { data, isLoading, refetch } = useGetCourseDetailWithStatusQuery(courseId);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) refetch();
  }, [user?._id, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-700 dark:text-gray-200">
        <Loader className="animate-spin h-16 w-16 text-blue-600" />
      </div>
    );
  }

  const { course, purchased } = data || {};

  const handlePlayPreview = (lecture) => {
    if (!lecture.isPreviewFree && !purchased) return;
    setPreviewUrl(lecture.videoUrl || lecture.joinUrl);
    setIsPreviewOpen(true);
  };

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  
  const firstAccessibleLecture = course?.lectures?.find(
    (lecture) => lecture.isPreviewFree || purchased === "completed"
  );

  return (
    <div className="space-y-5">
      {isPreviewOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="w-[70%] h-[50%] bg-black rounded shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <ReactPlayer url={previewUrl} width="100%" height="100%" controls />
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-2 right-2 text-white text-xl font-bold"
            >
              <X/>
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle || "Course Title"}
          </h1>
          <p className="text-base md:text-lg">{course?.subTitle || "Course Sub-title"}</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator?.name || "Unknown"}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt?.split("T")[0] || "Unknown"}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course?.description || "" }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course?.lectures?.map((lecture, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-sm cursor-pointer ${
                    lecture.isPreviewFree || purchased === "completed"
                      ? "text-blue-600 hover:underline"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => handlePlayPreview(lecture)}
                >
                  <span>
                    {lecture.isPreviewFree || purchased === "completed" ? (
                      <PlayCircle size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Course Reviews</CardTitle>
                <CardDescription>What learners are saying</CardDescription>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-yellow-500 text-lg font-semibold">
                  {"★".repeat(Math.round(averageRating))}
                  {"☆".repeat(5 - Math.round(averageRating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} / 5
                </p>
                <p className="text-xs text-muted-foreground">
                  {reviews.length} reviews
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 h-52 overflow-y-auto">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No reviews yet for this course.
                </p>
              ) : (
                reviews.map((review, idx) => (
                  <div key={idx} className="border-b pb-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {review?.userId?.name || "Anonymous"}
                      </p>
                      <div className="text-yellow-500 text-sm">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              {firstAccessibleLecture?.videoUrl ? (
                <div className="w-full aspect-video mb-4">
                  <ReactPlayer
                    width="100%"
                    height="100%"
                    url={firstAccessibleLecture.videoUrl}
                    controls={true}
                    light={firstAccessibleLecture.thumbnail || true} 
                  />
                </div>
              ) : (
                <div className="w-full aspect-video mb-4 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No preview available</p>
                </div>
              )}
              <h1>{firstAccessibleLecture?.lectureTitle || "No lecture available"}</h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">Course Price</h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased === "completed" ? (
                <Button onClick={handleContinueCourse} className="w-full bg-blue-500 hover:bg-blue-400 text-white">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} className='bg-blue-500 text-white hover:bg-blue-600'/>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
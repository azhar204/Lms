import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  CirclePlay,
  CheckCircle,
  Star,
  Bot,
  Loader,
  Video,
  Radio,
  X,
} from "lucide-react";
import {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation,
} from "@/features/api/courseProgressApi";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function CourseProgress() {
  const { courseId } = useParams();
  const email = useSelector((state) => state.auth?.user?.email);
  const name = useSelector((state) => state.auth?.user?.name);
  const userId = useSelector((state) => state.auth?.user?._id);
  const [showInfoBar, setShowInfoBar] = useState(false);
  const enrolledCourse = useSelector((state) =>
    state.auth?.user?.enrolledCourses?.find((course) => course._id === courseId)
  );

  const courseThumbnail = enrolledCourse?.courseThumbnail;
  const courseTitle = enrolledCourse?.courseTitle;

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse] = useCompleteCourseMutation();
  const [inCompleteCourse] = useInCompleteCourseMutation();

  const [open, setOpen] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { rating: 5, comment: "" },
  });
  const {
    register: registerShare,
    handleSubmit: handleSubmitShare,
    reset: resetShare,
    formState: { errors: shareErrors, isSubmitting: isShareSubmitting },
  } = useForm({
    defaultValues: { username: "" },
  });

  const submitReview = async (vals) => {
    try {
      const res1 = await axios.post(
        `http://localhost:8082/api/v1/reviews/${courseId}`,
        { ...vals, userId, courseId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      await axios.post(
        `http://localhost:8082/api/v1/webhook/share-review-webhook`,
        { ...vals, courseId, email, name, userId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success(res1.data?.message || "Review submitted", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  const sharePost = async (values) => {
    try {
      const res = await axios.post(
        "http://localhost:8082/api/v1/webhook/share-course-webhook",
        {
          ...values,
          email,
          courseThumbnail,
          courseTitle,
          name,
        },
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${values.username}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Certificate downloaded!", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      resetShare();
      setOpenShareDialog(false);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download certificate", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  const isLectureCompleted = (id) =>
    data?.data?.progress?.some((p) => p.lectureId === id && p.viewed);

  const handleLecturePlay = async (lecId) => {
    await updateLectureProgress({ courseId, lectureId: lecId });
    refetch();
  };

  const getLectureStatus = (lecture) => {
    if (!lecture.isLive && lecture.videoUrl) return "recorded";
    const now = new Date();
    const startTime = new Date(lecture.startTime);
    if (now >= startTime && now <= new Date(startTime.getTime())) return "live";
    return "ended";
  };
  useEffect(() => {
  if (data?.data?.courseDetails.enrolledStudents?.includes(userId)) {
    setShowInfoBar(!!data?.data?.completed);
  } else {
    setShowInfoBar(false);
  }
}, [data, userId]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }
  if (isError) {
    return <p className="text-center text-red-500">Failed to load course</p>;
  }
 
  const { courseDetails, progress, completed } = data.data;
  const isUserEnrolled = courseDetails.enrolledStudents?.includes(userId);
  const initialLecture = currentLecture || courseDetails.lectures[0];


 
  return (
    <div className="max-w-7xl mx-auto p-4">
      
      {showInfoBar && (
        <div className="mb-4 bg-green-500 text-white text-center py-2 flex items-center justify-center rounded-md shadow-md">

          <span className="font-medium">
            🎉 Congratulations! You’ve completed the course. Download your certificate and share your achievement on social media using the <strong>Share</strong> button.
          </span>
          <button
            className="ml-4 text-white hover:text-gray-200"
            onClick={() => setShowInfoBar(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold">
              {courseDetails.courseTitle}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={completed ? "outline" : "default"}
                onClick={async () => {
                  if (completed) {
                    await inCompleteCourse(courseId);
                  } else {
                    await completeCourse(courseId);
                  }
                  refetch();
                }}
                className=" text-white bg-blue-500 hover:bg-blue-600 hover:text-white"
              >
                {completed ? (
                  <span className="flex items-center ">
                    <CheckCircle className="h-4 w-4 mr-1 " /> Completed
                  </span>
                ) : (
                  "Mark as Completed"
                )}
              </Button>
              {completed && isUserEnrolled && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setOpen(true)}
                    className="hover:bg-blue-500 hover:text-white"
                  >
                    <Star className="h-4 w-4 mr-1" /> Review
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setOpenShareDialog(true)}
                    className="hover:bg-blue-500 hover:text-white"
                  >
                    <Bot className="h-4 w-4 mr-1" /> Share
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video/Iframe + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 lg:w-3/5">
          <CardContent className="p-4">
            {initialLecture.joinUrl || initialLecture.videoUrl ? (
              <div>
                {initialLecture.isLive && (
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="h-4 w-4 text-red-600" />
                    <Badge
                      variant={
                        getLectureStatus(initialLecture) === "live"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {getLectureStatus(initialLecture) === "live"
                        ? "Live"
                        : "live"}
                    </Badge>
                  </div>
                )}
                <iframe
                  key={initialLecture._id}
                  src={initialLecture.videoUrl || initialLecture.joinUrl}
                  style={{ border: 0, width: "100%", aspectRatio: "16/9" }}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="rounded-md"
                  onLoad={() => handleLecturePlay(initialLecture._id)}
                ></iframe>
              </div>
            ) : initialLecture.videoUrl ? (
              <video
                key={initialLecture._id}
                src={initialLecture.videoUrl || initialLecture.joinUrl}
                controls
                className="w-full rounded-md"
                onPlay={() => handleLecturePlay(initialLecture._id)}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <Video className="h-6 w-6 mr-2" />
                <span>Video content not yet available.</span>
              </div>
            )}
            <p className="mt-2 font-medium">
              Lecture{" "}
              {courseDetails.lectures.findIndex(
                (l) => l._id === initialLecture._id
              ) + 1}
              : {initialLecture.lectureTitle}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:w-2/5">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Course Lectures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courseDetails.lectures.map((lec) => (
              <Card
                key={lec._id}
                className={`cursor-pointer p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                  lec._id === (currentLecture?._id || initialLecture._id)
                    ? "bg-gray-300 dark:bg-gray-600"
                    : ""
                }`}
                onClick={() => {
                  setCurrentLecture(lec);
                  handleLecturePlay(lec._id);
                }}
              >
                <CardContent className="flex items-center justify-between p-0">
                  <div className="flex items-center gap-2">
                    {lec.isLive ? (
                      <Radio className="h-4 w-4 text-red-600" />
                    ) : isLectureCompleted(lec._id) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <CirclePlay className="h-4 w-4" />
                    )}
                    <span className="text-base">{lec.lectureTitle}</span>
                    {lec.isLive && (
                      <Badge
                        variant={
                          getLectureStatus(lec) === "live"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {getLectureStatus(lec) === "live" ? "Live" : "live"}
                      </Badge>
                    )}
                    {!lec.isLive && lec.videoUrl && (
                      <Badge variant="secondary">Recorded</Badge>
                    )}
                  </div>
                  {isLectureCompleted(lec._id) &&
                    (!lec.isLive ||
                      (lec.isLive && getLectureStatus(lec) === "ended")) && (
                      <Badge
                        variant="outline"
                        className="bg-green-200 text-green-600"
                      >
                        Done
                      </Badge>
                    )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(submitReview)} className="space-y-4">
            <div>
              <Label className="text-sm">Rating (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                {...register("rating", { required: true, min: 1, max: 5 })}
                className="mt-1"
              />
              {errors.rating && (
                <p className="text-red-500 text-sm">Rating must be 1-5</p>
              )}
            </div>
            <div>
              <Label className="text-sm">Comment</Label>
              <Textarea
                rows={4}
                {...register("comment", {
                  required: "Comment required",
                  minLength: { value: 10, message: "Min 10 characters" },
                })}
                className="mt-1"
              />
              {errors.comment && (
                <p className="text-red-500 text-sm">{errors.comment.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className='bg-blue-500 text-white hover:bg-blue-600'>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitShare(sharePost)} className="space-y-4">
            <div>
              <Label className="text-sm">Username</Label>
              <Input
                type="text"
                {...registerShare("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
                className="mt-1"
              />
              {shareErrors.username && (
                <p className="text-red-500 text-sm">
                  {shareErrors.username.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isShareSubmitting} className='bg-blue-500 text-white hover:bg-blue-600'>
              {isShareSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sharing
                </>
              ) : (
                "Share"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

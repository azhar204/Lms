import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Lecture from "./Lecture";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useCreateLiveLectureMutation,
} from "@/features/api/courseApi";

export default function CreateLecture() {
  const isInstructor = true;
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isLiveLecture, setIsLiveLecture] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [createLecture, { isLoading: creating, isSuccess, data, error }] =
    useCreateLectureMutation();
  const [
    createLiveLecture,
    {
      isLoading: creatingLive,
      isSuccess: liveSuccess,
      data: liveData,
      error: liveError,
    },
  ] = useCreateLiveLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery(courseId);

  const onSubmit = async (values) => {
    if (isLiveLecture) {
      await createLiveLecture({
        courseId,
        lectureTitle: values.lectureTitle.trim(),
        startTime: new Date().toISOString(),
      });
    } else {
      await createLecture({
        courseId,
        lectureTitle: values.lectureTitle.trim(),
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Lecture created", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      reset();
      refetch();
    }
    if (liveSuccess) {
      console.log("Live lecture response:", JSON.stringify(liveData));
      toast.success(liveData.message || "Live lecture created", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      reset();
      refetch();
    }
    if (error)
      toast.error(error?.data?.message || "Failed to create lecture", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    if (liveError) {
      console.log("Live lecture error:", JSON.stringify(liveError, null, 2));
      toast.error(liveError?.data?.message || "Failed to create live lecture", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  }, [
    isSuccess,
    liveSuccess,
    error,
    liveError,
    data,
    liveData,
    reset,
    refetch,
  ]);

  useEffect(() => {
    const needsPolling = lectureData?.lectures?.some(
      (lec) => lec.isLive && (!lec.streamUrl || !lec.streamKey)
    );

    let pollingInterval;
    if (needsPolling) {
      pollingInterval = setInterval(() => {
        console.log("Polling for live stream credentials...");
        refetch();
      }, 5000);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [lectureData, refetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add a New Lecture</CardTitle>
          <p className="text-sm text-muted-foreground">
            Provide a title and check on live lecture to create live lecture.
            For live lectures, use OBS with the provided Stream URL and Stream
            Key.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="lectureTitle">Title</Label>
              <Input
                id="lectureTitle"
                placeholder="Enter lecture title"
                {...register("lectureTitle", {
                  required: "Title is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  pattern: {
                    value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                    message: "Only letters and single spaces allowed",
                  },
                })}
                className="mt-1"
              />
              {errors.lectureTitle && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lectureTitle.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isLive"
                checked={isLiveLecture}
                onCheckedChange={setIsLiveLecture}
              />
              <Label htmlFor="isLive">Create as live lecture</Label>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/course/${courseId}`)}
                className="hover:bg-gray-200 dark:hover:bg-gray-600 "
              >
                Back to Course
              </Button>
              <Button type="submit" disabled={creating || creatingLive} className="text-white bg-blue-500 hover hover:bg-blue-700">
                {creating || creatingLive ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : isLiveLecture ? (
                  "Create Live Lecture"
                ) : (
                  "Create Lecture"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-10">
        {lectureLoading ? (
          <p className="text-center text-gray-600">Loading lectures…</p>
        ) : lectureError ? (
          <p className="text-center text-red-500">Failed to load lectures.</p>
        ) : lectureData?.lectures?.length === 0 ? (
          <p className="text-center text-gray-600">No lectures available.</p>
        ) : (
          lectureData.lectures.map((lec, idx) => (
            <Lecture
              key={lec._id}
              lecture={lec}
              courseId={courseId}
              index={idx}
              isInstructor={isInstructor}
            />
          ))
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteCourseMutation,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  usePublishCourseMutation,
} from "@/features/api/courseApi";
import RichTextEditor from "@/components/RichTextEditor";
import { useForm, Controller } from "react-hook-form";

const categories = [
  "Next JS",
  "Data Science",
  "Frontend Development",
  "Fullstack Development",
  "MERN Stack Development",
  "Javascript",
  "Python",
  "Docker",
  "MongoDB",
  "HTML",
];
const levels = ["Beginner", "Medium", "Advance"];

export default function CourseTab() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState("");
  const {
    data: courseByIdData,
    isLoading: courseByIdLoading,
    refetch,
  } = useGetCourseByIdQuery(courseId);

  const [editCourse, { isLoading }] = useEditCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await deleteCourse(courseId).unwrap();
      toast.success(res?.message || "Course deleted successfully", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      navigate("/admin/course");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error?.data?.message || "Failed to delete course", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  useEffect(() => {
    if (courseByIdData?.course) {
      const c = courseByIdData.course;
      setValue("courseTitle", c.courseTitle);
      setValue("subTitle", c.subTitle);
      setValue("description", c.description);
      setValue("category", c.category);
      setValue("courseLevel", c.courseLevel);
      setValue("coursePrice", String(c.coursePrice));
    }
  }, [courseByIdData, setValue]);

  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("courseThumbnail", {
          message: "Only image files are allowed",
        });
        return;
      }
      setValue("courseThumbnail", file);
      clearErrors("courseThumbnail");
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    const nameRegex = /^[A-Za-z0-9&:+\- ]{3,}$/;
    if (!nameRegex.test(data.courseTitle)) {
      setError("courseTitle", {
        message: "Allow Only letters, numbers, spaces, and symbols",
      });
      return;
    }
    if (data.subTitle.trim().length < 5) {
      setError("subTitle", {
        message: "Subtitle must be at least 5 characters",
      });
      return;
    }
    if (
      !data.description ||
      data.description.replace(/<[^>]*>/g, "").length < 10
    ) {
      setError("description", {
        message: "Description is required (min 10 characters)",
      });
      return;
    }
    if (!/^[1-9][0-9]*$/.test(data.coursePrice)) {
      setError("coursePrice", { message: "Price must be a positive integer" });
      return;
    }
    if (!data.courseThumbnail) {
      setError("courseThumbnail", { message: "Thumbnail is required" });
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null) formData.append(k, v);
    });
    await editCourse({ formData, courseId });
    toast.success("Course updated", {
      style: {
        background: "transparent",
        color: "#3b82f6",
        border: "1px solid #3b82f6",
        boxShadow: "none",
      },
    });
  };

  const [publishing, setPublishing] = useState(false); 

  const publishStatusHandler = async () => {
    const action = courseByIdData?.course.isPublished ? "false" : "true";
      setPublishing(true); 
    try {
      const res = await publishCourse({ courseId, query: action });
      refetch();
      toast.success(res.data.message, {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
    } catch (error) {
      toast.error(
        error?.data?.message ||
          "Failed to change publish status due to some student enrollment in this Corse",
        {
          style: { background: "white", color: "#ef4444" },
        }
      );
    } finally {
    setPublishing(false); 
  }
  };

  if (courseByIdLoading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-700 dark:text-gray-200">
        <Loader className="animate-spin h-16 w-16 text-blue-600" />
      </div>
    );

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Basic Course Information</CardTitle>
          <CardDescription>Update your course details.</CardDescription>
        </div>
        <div className="space-x-2">
          <Button
            disabled={
              courseByIdData?.course.lectures.length === 0 || publishing
            }
            onClick={publishStatusHandler}
            className="text-white bg-blue-500 hover:bg-blue-700"
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : courseByIdData?.course.isPublished ? (
              "Unpublish"
            ) : (
              "Publish"
            )}
          </Button>

          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-white bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-5">
          <div>
            <Label>Title</Label>
            <Input {...register("courseTitle")} />
            {errors.courseTitle && (
              <p className="text-red-500 text-sm">
                {errors.courseTitle.message}
              </p>
            )}
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input {...register("subTitle")} />
            {errors.subTitle && (
              <p className="text-red-500 text-sm">{errors.subTitle.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  input={{ description: field.value }}
                  setInput={({ description }) => field.onChange(description)}
                />
              )}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-5 flex-wrap">
            <div>
              <Label>Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Category</SelectLabel>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label>Course Level</Label>
              <Controller
                name="courseLevel"
                control={control}
                render={({ field }) => (
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Level</SelectLabel>
                        {levels.map((lvl) => (
                          <SelectItem key={lvl} value={lvl}>
                            {lvl}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.courseLevel && (
                <p className="text-red-500 text-sm">
                  {errors.courseLevel.message}
                </p>
              )}
            </div>

            <div>
              <Label>Price (PKR)</Label>
              <Input
                type="number"
                className="w-40"
                {...register("coursePrice")}
              />
              {errors.coursePrice && (
                <p className="text-red-500 text-sm">
                  {errors.coursePrice.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Course Thumbnail</Label>
            <Input type="file" accept="image/*" onChange={handleThumbnail} />
            {errors.courseThumbnail && (
              <p className="text-red-500 text-sm">
                {errors.courseThumbnail.message}
              </p>
            )}
            {preview && (
              <img src={preview} alt="preview" className="h-48 mt-2" />
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/course")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="text-white bg-blue-500 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

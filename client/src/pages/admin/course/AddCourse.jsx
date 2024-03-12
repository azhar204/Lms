import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const AddCourse = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      courseTitle: "",
      category: "",
    },
  });

  const [createCourse, { data, isLoading, isSuccess }] =
    useCreateCourseMutation();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
    await createCourse(values).unwrap();
  } catch (err) {
    toast.error(err?.data?.message || "Failed to create course");
  }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Course created.", {
      style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
    });
      navigate("/admin/course");
    }
  }, [isSuccess]);

 

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add a course. Provide basic details for your new course.
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill out the form below and click create.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            placeholder="Your Course Name"
            {...register("courseTitle", {
              required: "Course title is required",
              pattern: {
                value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                message:
                  "Only letters and single spaces allowed (no numbers or special characters)",
              },
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters",
              },
              maxLength: {
                value: 50,
                message: "Title must be under 50 characters",
              },
              validate: (val) =>
                val.trim() !== "" || "Title cannot be only whitespace",
            })}
          />
          {errors.courseTitle && (
            <p className="text-red-500 text-sm">{errors.courseTitle.message}</p>
          )}
        </div>

        <div>
          <Label>Category</Label>
          <Select
            onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                {[
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
                ].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">
              {errors.category.message || "Category is required"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/course")} type="button">
            Back
          </Button>
          <Button type="submit" disabled={isLoading} className="text-white bg-blue-500 hover:bg-blue-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;

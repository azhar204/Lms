import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import {
  useGetLectureByIdQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import { useForm } from "react-hook-form";
import axios from "axios";

const MEDIA_API = "http://localhost:8082/api/v1/media";

export default function LectureTab() {
  const { courseId, lectureId } = useParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lectureTitle: "",
      isPreviewFree: false,
      videoUrl: "",
      publicId: "",
    },
  });

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [editLecture, { isLoading: saving }] = useEditLectureMutation();
  const [removeLecture, { isLoading: removing }] = useRemoveLectureMutation();
  const { data: lectureData, isLoading: loadingLecture } =
    useGetLectureByIdQuery(lectureId);

  useEffect(() => {
    if (lectureData?.lecture) {
      const lec = lectureData.lecture;
      setValue("lectureTitle", lec.lectureTitle);
      setValue("isPreviewFree", lec.isPreviewFree);
      setValue("videoUrl", lec.videoInfo?.videoUrl || "");
      setValue("publicId", lec.videoInfo?.publicId || "");
    }
  }, [lectureData, setValue]);

  const handleVideo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("videoUrl", { message: "Only video files are allowed" });
      return;
    }
    clearErrors("videoUrl");
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
        onUploadProgress: ({ loaded, total }) => {
          setProgress(Math.round((loaded * 100) / total));
        },
      });
      if (res.data.success) {
        setValue("videoUrl", res.data.data.url);
        setValue("publicId", res.data.data.public_id);
        toast.success("Video uploaded", {
          style: {
            background: "transparent",
            color: "#3b82f6",
            border: "1px solid #3b82f6",
            boxShadow: "none",
          },
        });
      }
    } catch (err) {
      toast.error("Upload failed", err, {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onSubmit = async (values) => {
    const nameRegex = /^[A-Za-z0-9&:+\- ]{3,}$/;
    if (!nameRegex.test(values.lectureTitle.trim())) {
      setError("lectureTitle", {
        message: "Allow Only letters, numbers, spaces, and symbols",
      });
      return;
    }
    if (!values.videoUrl) {
      setError("videoUrl", { message: "Video is required" });
      return;
    }
    await editLecture({
      lectureTitle: values.lectureTitle.trim(),
      videoInfo: { videoUrl: values.videoUrl, publicId: values.publicId },
      isPreviewFree: values.isPreviewFree,
      courseId,
      lectureId,
    });
    toast.success("Lecture updated", {
      style: {
        background: "transparent",
        color: "#3b82f6",
        border: "1px solid #3b82f6",
        boxShadow: "none",
      },
    });
  };

  const handleRemove = async () => {
    await removeLecture(lectureId);
    toast.success("Lecture removed", {
      style: {
        background: "transparent",
        color: "#3b82f6",
        border: "1px solid #3b82f6",
        boxShadow: "none",
      },
    });
  };

  if (loadingLecture) return <p>Loading…</p>;

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>Make changes and click save.</CardDescription>
        </div>
        <Button
          variant="destructive"
          disabled={removing}
          onClick={handleRemove}
        >
          {removing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </>
          ) : (
            "Remove Lecture"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Title</Label>
            <Input
              {...register("lectureTitle", { required: true })}
              placeholder="Lecture title"
            />
            {errors.lectureTitle && (
              <p className="text-red-500 text-sm">
                {errors.lectureTitle.message}
              </p>
            )}
          </div>

          <div>
            <Label>
              Video <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={handleVideo}
              className="w-fit"
            />
            {errors.videoUrl && (
              <p className="text-red-500 text-sm">{errors.videoUrl.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              {...register("isPreviewFree")}
              checked={watch("isPreviewFree")}
              onCheckedChange={(v) => setValue("isPreviewFree", v)}
            />
            <Label>Is this video FREE</Label>
          </div>

          {uploading && (
            <div>
              <Progress value={progress} />
              <p className="text-sm">{progress}% uploaded</p>
            </div>
          )}

          <Button type="submit" disabled={uploading || saving} className="text-white bg-blue-500 hover:bg-blue-700">
            {uploading || saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

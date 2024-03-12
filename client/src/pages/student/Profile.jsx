import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
} from "@/features/api/authApi";
import Course from "./Course";

export default function Profile() {
  const { data, isLoading: loadingUser, refetch } = useLoadUserQuery();
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation();

  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { name: "", profilePhoto: null } });

  useEffect(() => {
    refetch();
    if (open && data?.user) {
      reset({ name: data.user?.name, profilePhoto: null });
      clearErrors();
    }
  }, [open, data, reset, clearErrors]);

  const onSubmit = async (vals) => {
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    if (!nameRegex.test(vals.name.trim())) {
      setError("name", { message: "Only letters and single spaces allowed" });
      return;
    }
    if (vals.profilePhoto && !vals.profilePhoto.type.startsWith("image/")) {
      setError("profilePhoto", { message: "Only image files allowed" });
      return;
    }

    const fd = new FormData();
    fd.append("name", vals.name.trim());
    if (vals.profilePhoto) fd.append("profilePhoto", vals.profilePhoto);

    const res = await updateUser(fd);
    if ("data" in res) {
      toast.success(res.data?.message || "Profile updated", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      setOpen(false);
      refetch();
    } else {
      toast.error(res.error?.data?.message || "Update failed", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  if (loadingUser) return <h1>Profile loading…</h1>;
  const user = data?.user;

  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
        PROFILE
      </h1>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage src={user?.photoUrl} />
          <AvatarFallback>{user?.name[0]}</AvatarFallback>
        </Avatar>

        <div>
          <p className="font-semibold">
            Name: <span className="font-normal ml-1">{user?.name}</span>
          </p>
          <p className="font-semibold">
            Email: <span className="font-normal ml-1">{user?.email}</span>
          </p>
          <p className="font-semibold">
            Role:{" "}
            <span className="font-normal ml-1">{user?.role.toUpperCase()}</span>
          </p>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-2 bg-blue-500 text-white hover:bg-blue-600">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your name or photo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    className="col-span-3"
                    {...register("name", {
                      required: "Name is required",
                      pattern: {
                        value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                        message: "Only letters and single spaces allowed",
                      },
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 col-span-4 text-sm">
                    {errors.name.message}
                  </p>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Profile Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    className="col-span-3"
                    onChange={(e) =>
                      setValue("profilePhoto", e.target.files?.[0] || null)
                    }
                  />
                  {errors.profilePhoto && (
                    <p className="text-red-500 col-span-4 text-sm">
                      {errors.profilePhoto.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving} className='bg-blue-500 text-white hover:bg-blue-600'>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* courses */}
      <h2 className="text-lg font-medium mt-8 mb-4">
        Courses you're enrolled in
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {user?.enrolledCourses.length === 0 ? (
          <p>You haven't enrolled yet.</p>
        ) : (
          user?.enrolledCourses.map((c) => <Course key={c._id} course={c} />)
        )}
      </div>
    </div>
  );
}

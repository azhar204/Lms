import { useForgotPasswordMutation } from "@/features/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      const res = await forgotPassword(data).unwrap();
      toast.success(res.message || "Check your email for reset link.", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
    } catch (err) {
      toast.error(err?.data?.message || "Request failed", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  return (
    <div className="flex justify-center items-center mt-20">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[400px] space-y-4 border rounded-2xl p-6 shadow"
      >
        <h2 className="text-xl font-semibold">Forgot Password</h2>
        <div>
          <Label>Email</Label>
          <Input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "Invalid email format",
              },
            })}
            type="email"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mb-1  bg-blue-600 hover:bg-slate-400 dark:text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;

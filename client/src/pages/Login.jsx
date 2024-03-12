import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginUserMutation } from "@/features/api/authApi";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loginUser, { data, error, isLoading, isSuccess }] =
    useLoginUserMutation();

  const navigate = useNavigate();

  const onSubmit = (formData) => loginUser(formData);

  useEffect(() => {
    if (isSuccess && data) {
      console.log(data);
      toast.success(data.message || "Login successful.", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      navigate("/");
    }
    if (error) {
      toast.error(error.data?.message || "Login Failed", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  }, [data, error, isSuccess]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen overflow-hidden dark:bg-gradient-to-b from-blue-900/30 to-black/30">
      <div className="flex justify-center items-start">
        <Card className="w-[400px] max-w-md shadow-md h-[480px] mt-12 flex justify-center flex-col dark:bg-gradient-to-b from-blue-900/30 to-black/30">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600 font-bold">
              Login
            </CardTitle>
            <CardDescription>Login to your account.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs font-bold">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true })}
                    placeholder="••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-red-400 text-xs font-bold">
                      Password is required
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="text-sm flex flex-col items-end gap-2 w-full">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:underline font-bold text-[#1A52A5]"
                >
                  Forgot Password?
                </Link>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mb-1  bg-blue-600 hover:bg-slate-400 dark:text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-[gray] text-sm mb-3 w-full text-right">
                Don't have an account?{" "}
                <span className="font-bold text-md text-blue-500">
                  <Link to="/signup">Sign UP</Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="flex hidden md:flex items-center justify-start  w-full h-full object-cover">
        <img
          src="/bg.png"
          alt="Background Image"
          className=" object-cover w-full" 
          style={{ width: "600px" }}
        />
      </div>
    </div>
  );
};

export default Login;

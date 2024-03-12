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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/features/api/authApi";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { data, error, isLoading: verifyingOtp, isSuccess }] =
    useVerifyOtpMutation();

  const navigate = useNavigate();

  const handleSendOtp = async (formData) => {
    try {
      const res = await sendOtp({ email: formData.email }).unwrap();
      toast.success(res.message, {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      setStep(2);
    } catch (err) {
      toast.error(err.data?.message || "Failed to send OTP", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  };

  const handleVerifyOtp = async (formData) => {
    await verifyOtp(formData)
  };

  useEffect(() => {
    if (isSuccess && data) {
      toast.success(data.message || "Signup successful.", {
        style: {
          background: "transparent",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          boxShadow: "none",
        },
      });
      navigate("/login");
    }
  }, [isSuccess, data, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.data?.message || "Signup Failed", {
        style: {
          background: "transparent",
          color: "red",
          border: "1px solid red",
          boxShadow: "none",
        },
      });
    }
  }, [error]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen overflow-hidden dark:bg-gradient-to-b from-blue-900/30 to-black/30">
      <div className="flex hidden md:flex items-center justify-end w-full h-full object-cover">
        <img
          src="/bg.png"
          alt="Background Image"
          className="object-cover w-full"
          style={{ width: "600px" }}
        />
      </div>

      <div className="flex justify-center items-start">
        {step === 1 && (
          <Card className="w-[400px] h-[520px] max-w-md shadow-md mt-10 flex flex-col dark:bg-gradient-to-b from-blue-900/30 to-black/30">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-500 font-bold">
                Signup
              </CardTitle>
              <CardDescription>Create a new account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleSendOtp)}>
              <CardContent className="space-y-2">
                {/* Name */}
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    {...register("name", {
                      required: "Name is required",
                      minLength: { value: 3, message: "Min 3 characters" },
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-bold">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
                    <p className="text-red-500 text-xs font-bold mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        pattern: {
                          value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
                          message:
                            "Min 6 chars, at least 1 letter and 1 number",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && (
                      <p className="text-red-500 text-xs font-bold mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Role</Label>
                  <Select
                    onValueChange={(value) => setValue("role", value)}
                    defaultValue="student"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-500 text-xs font-bold mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full bg-blue-600 hover:bg-slate-400 dark:text-white"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                <p className="text-sm w-full text-right">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-500 hover:underline font-bold"
                  >
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card className="w-[400px] h-[410px] max-w-md shadow-md mt-10 flex flex-col dark:bg-gradient-to-b from-blue-900/30 to-black/30 mx-4 md:mx-0">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-500 font-bold mt-7">
                Verify OTP
              </CardTitle>
              <CardDescription className="mt-12">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-bold">{watch("email")}</span>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(handleVerifyOtp)}>
              <CardContent className="space-y-2">
                <Input
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "OTP must be 6 digits",
                    },
                  })}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="text-center tracking-widest text-lg mt-5"
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs font-bold">
                    {errors.otp.message}
                  </p>
                )}

                <div className="flex justify-between w-full text-sm mt-5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-gray-500 hover:underline"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp({ email: watch("email") })}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                </div>
              </CardContent>
              <CardFooter className="mt-7">
                <Button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full bg-blue-500 hover:bg-slate-400 dark:text-white"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                      wait
                    </>
                  ) : (
                    "Verify & Register"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Signup;

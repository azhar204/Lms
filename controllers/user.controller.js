import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import { OTP } from "../models/otp.model.js";



export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, 
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    
    await transporter.sendMail({
      from: `"Smart Learning" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes.</p>`,
    });

    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOTPAndRegister = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;

    const record = await OTP.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await OTP.deleteOne({ email });

    return res.status(201).json({ success: true, message: "Account created successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};


export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }
        if(user.photoUrl){
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            deleteMediaFromCloudinary(publicId);
        }

        const cloudResponse = await uploadMedia(profilePhoto.buffer);
        const photoUrl = cloudResponse.secure_url;

        const updatedData = {name, photoUrl};
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile"
        })
    }
}


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" }
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
        from: `"Smart Learning" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Smart Learning - Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
                <h2 style="color: #2c3e50;">Smart Learning</h2>
            </div>
            <div style="padding: 20px; text-align: center;">
                <h3 style="color: #2c3e50;">Password Reset Request</h3>
                <p style="color: #555; font-size: 15px;">
                We received a request to reset your password. Click the button below to reset it. 
                This link is valid for <strong>10 minutes</strong>.
                </p>
                <a href="${resetUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #4CAF50; color: #fff; text-decoration: none; font-size: 16px; border-radius: 6px;">
                Reset Password
                </a>
                <p style="margin-top: 30px; font-size: 13px; color: #999;">
                If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>
            <div style="text-align: center; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #aaa;">
                &copy; ${new Date().getFullYear()} Smart Learning. All rights reserved.
            </div>
            </div>
        `,
        });


    res.json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;


    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const blockInstructor = async (req, res) => {
  try {
    const { instructorId } = req.body;

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res.status(404).json({ message: "Instructor not found." });
    }

    instructor.isBlocked = !instructor.isBlocked; 
    await instructor.save();

    res.status(200).json({
      success: true,
      message: `Instructor ${instructor.isBlocked ? "blocked" : "unblocked"} successfully`,
      instructor,
    });
  } catch (error) {
    console.error("Error blocking instructor:", error);
    res.status(500).json({ message: "Failed to block instructor" });
  }
};
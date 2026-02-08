import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs"; // Changed from "bcrypt.js" to standard "bcryptjs"
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // FIXED: Typo 'findOnde' -> 'findOne'
        const user = await User.findOne({ email });
        
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        
        await User.create({
            name,
            email,
            password: hashpassword,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
        });

    } catch (err) {
        console.log("Server Error", err);
        return res.status(500).json({
            success: false,
            message: "User registration failed",
        });
    }
}; // <--- ADDED Closing brace for register function here

// FIXED: Moved login function outside of register function
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // FIXED: Typo 'findOnde' -> 'findOne'
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        // This calls your helper function to send the cookie and JSON response
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (err) {
        console.log("Login error", err);
        return res.status(500).json({
            success: false,
            message: "Failed to login"
        });
    }
};
export const logout = async (req, res) => {
    try {
        res.clearCookie("token");   
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        console.log("Logout error", err);
        return res.status(500).json({ success: false, message: "Failed to logout" });
    }
};
export const getProfile = async (req, res) => { 
    try{
        const userID=req.id;
        const user=await User.findById(userID).select("-password -__v -createdAt -updatedAt");
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });   
    }
       catch(err){
        console.log("Get profile error", err);
        return res.status(500).json({ success: false, message: "Failed to get profile" });
       }
};

export const updateProfile = async (req, res) => {
 
    try{
        const userID=req.id;
        const {name}=req.body;
        const photourl=req.file? req.file.path : undefined;
        const user=await User.findById(userID);
        
        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // If user uploads new photo, delete the old one from Cloudinary
        if(user.photoUrl){
            const public_id=user.photourl.split("/").slice(-1)[0].split(".")[0];
            await deleteMediaFromCloudinary(public_id);
        }
        
        // Update user profile with new name and photo URL
        let updatedData = {name};
        if(photourl){
            const cloudResponse = await uploadMedia(photourl);
            updatedData.photoUrl = cloudResponse.secure_url;
        }
        
        const updatedUser=await User.findByIdAndUpdate(userID, updatedData, {new:true}).select("-password -__v -createdAt -updatedAt");
        return res.status(200).json({ success: true, user: updatedUser });
    }catch(err){
        console.log("Update profile error", err);
        return res.status(500).json({ success: false, message: "Failed to update profile" });
    }

}
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
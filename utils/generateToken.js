import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
    // 1. Fixed syntax: { expiresIn: "1d" } instead of comma
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1d", 
    });

    return res
        .status(200)
        .cookie("token", token, {
            httpOnly: true,
            // 2. Fixed typo: 'sameSite' (singular) and value 'strict'
            sameSite: "strict", 
            maxAge: 24 * 60 * 60 * 1000,
            // 3. Recommended: Only send cookie over HTTPS in production
            secure: process.env.NODE_ENV === "production", 
        })
        .json({
            success: true,
            message,
            user,
        });
};
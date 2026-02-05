import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,      // Changed "string" to String (Best practice)
        required: true,    // Fixed typo: was "require"
    },
    email: {
        type: String,
        required: true,
        unique: true,      // Added this! Two users shouldn't have the same email.
    },
    password: {
        type: String,
        required: true,    // Fixed typo: was "requird"
    },
    role: {
        type: String,
        enum: ["instructor", "student"], // Fixed typo: was "studnt"
        default: "student",
    },
    enrolledCourses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }],
    photoUrl: {
        type: String,
        default: ""        // Fixed typo: was "defalut"
    },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
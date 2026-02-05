import express from 'express';
import dotenv from 'dotenv';
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js"; // 1. Added Import
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

// call db
connectDB();

const app = express();

// 2. Added Middleware to parse JSON body (Crucial for req.body to work)
app.use(express.json());
app.use(cookieParser()); // 3. Added Cookie Parser Middleware
app.use(cors(
 { origin: 'http://localhost:5173', // Adjust as needed
   credentials: true }
)); // 4. Added CORS Middleware
const PORT = process.env.PORT || 8080;

// Routes
app.use("/api/v1/user", userRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
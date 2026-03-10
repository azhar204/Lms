import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import reviewsRoute from "./routes/courseReview.route.js"
import webhookRoute from "./routes/webhook.route.js";
import redditRoute from "./routes/trendTopics.route.js"

dotenv.config({});


connectDB();
const app = express();

const PORT = process.env.PORT || 3000;



app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin:["http://localhost:5173","https://lms-final-year-project-drab.vercel.app"],
    credentials:true
}));

// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/reviews",reviewsRoute)
app.use("/api/v1/webhook", webhookRoute);
app.use("/api/v1/reddit", redditRoute);


app.get("/", (req, res) => {
  res.send("Backend is running ");
});

app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});

app.get("/",()=>{
    console.log("Backend is running......");
    
})

export default app;



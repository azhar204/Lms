import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star,  Heart } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";



const Course = ({ course }) => {
const [reviews, setReviews] = useState([]);
const courseId=course._id
  useEffect(() => {
      const fetchReviews = async () => {
        try {
          const res = await axios.get(
            `http://localhost:8082/api/v1/reviews/${courseId}`,
            {
              withCredentials: true,
            }
          );
          setReviews(res.data.reviews); 
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        }
      };
  
      fetchReviews();
    }, [courseId]);

 const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Link to={`/course-detail/${course._id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 group">
        
          <button
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white transition-opacity opacity-0 group-hover:opacity-100"
            onClick={(e) => e.preventDefault()}
          >
            <Heart className="h-4 w-4 text-gray-700" />
          </button>

          <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
            <img
              src={course.courseThumbnail}
              alt="course"
              className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
              onLoad={(e) => e.target.classList.remove("opacity-0")}
            />
          </div>

          <CardContent className="px-5 py-4 space-y-3">
            <h1 className="font-bold text-lg truncate bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent bg-[length:200%_auto] hover:bg-[length:100%_auto] transition-all duration-500">
              {course.courseTitle}
            </h1>

            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {reviews?.length > 0
                  ? `${averageRating.toFixed(1)} (${
                      reviews.length
                    } reviews)`
                  : "No reviews yet"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 transition-transform hover:scale-110 border-2 border-white shadow-sm">
                  <AvatarImage src={course.creator?.photoUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {course.creator?.name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm hover:underline decoration-wavy">
                  {course.creator?.name}
                </span>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 text-xs rounded-full shadow-sm">
                {course.courseLevel}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rs {course.coursePrice}
              </span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                0% OFF
              </Badge>
            </div>

            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${Math.round((averageRating.toFixed(1) / 5) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400">
                Statisfied Student
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default Course;

import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const SearchResult = ({ course }) => {
   
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-300 py-4 gap-4">
      <Link
        to={`/course-detail/${course._id}`}
        className="flex flex-col md:flex-row gap-4 w-full md:w-auto"
      >
        <img
          src={course.courseThumbnail}
          alt="course-thumbnial"
          className="h-32 w-full md:w-56 object-cover rounded"
        />
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-lg md:text-xl">{course.courseTitle}</h1>
          <p className="text-sm text-gray-600 dark:text-white">{course.subTitle}</p>
         <p className="text-sm text-gray-700">
            Intructor: <span className="font-bold">{course.creator?.name || "Unknow"}</span>{" "}
          </p>
          <Badge className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-xs rounded-full shadow-sm text-center ">
            {course.courseLevel || "N/A"}
          </Badge> 
        </div>
      </Link>
      <div className="mt-4 md:mt-0 md:text-right w-full md:w-auto">
        <h1 className="font-bold text-lg md:text-xl">Rs {course.coursePrice}</h1>
      </div>
    </div>
  );
};

export default SearchResult;

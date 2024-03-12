import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { Loader } from "lucide-react";

import { useParams, Navigate } from "react-router-dom";

const PurchaseCourseProtectedRoute = ({ children }) => {
  const { courseId } = useParams();
  const { data, isLoading } = useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-700 dark:text-gray-200">
        <Loader className="animate-spin h-16 w-16 text-blue-600" />
      </div>
    );

  return data?.purchased ? (
    children
  ) : (
    <Navigate to={`/course-detail/${courseId}`} />
  );
};
export default PurchaseCourseProtectedRoute;

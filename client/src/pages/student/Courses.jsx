import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
 
const Courses = () => {
  const {data, isLoading, isError} = useGetPublishedCourseQuery();
 
  if(isError) return <h1 className="text-center text-red-500 text-xl py-20">Unable to load courses. Please try again later.</h1>

  return (
    <div className="bg-gray-50 dark:bg-gradient-to-b dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-extrabold text-4xl text-center mb-4 text-gray-900 dark:text-white">
          Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Courses</span>
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Explore our hand-picked selection of expert-led courses
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : (
           data?.courses && data.courses.map((course, index) => <Course key={index} course={course}/>) 
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

const CourseSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      <Skeleton className="w-full h-40 rounded-t-2xl" />
      <div className="p-5 space-y-4">
        <Skeleton className="h-6 w-4/5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
};
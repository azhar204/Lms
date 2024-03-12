import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const userId = useSelector((state) => state.auth.user?._id);
  const { data, isError, isLoading, isFetching, refetch } =
    useGetPurchasedCoursesQuery(undefined, {
      skip: !userId,
    });
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (user?._id) refetch();
  }, [user?._id, refetch]);
  if (isLoading || isFetching)
    return (
      <div className="flex justify-center items-center h-96 text-gray-700 dark:text-gray-200">
        <Loader className="animate-spin h-16 w-16 text-blue-600" />
      </div>
    );
  if (isError)
    return (
      <div className="text-red-500 dark:text-red-400 text-center">
        Failed to get purchased courses
      </div>
    );
  if (!userId)
    return (
      <div className="text-red-500 dark:text-red-400 text-center">
        User not authenticated
      </div>
    );

  const { purchasedCourses = [], message } = data || {};

  const courseData =
    purchasedCourses.length > 0
      ? purchasedCourses.map((course) => ({
          name: course.courseId?.courseTitle || "Unknown Course",
          price: course.courseId?.coursePrice || 0,
        }))
      : [];

  const totalRevenue = purchasedCourses.reduce(
    (acc, course) => acc + (course.amount || 0),
    0
  );
  const totalSales = purchasedCourses.length;

  return (
    <div className="flex flex-col gap-3">
      <Link
        to="/admin/student-progress"
        className="text-blue-500 cursor-pointer hover:underline text-lg font-medium"
      >
        Check Student Progress
      </Link>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 bg-gray-100 dark:bg-gray-900 transition-colors">
        {message && (
          <div className="col-span-full text-gray-500 dark:text-gray-400 text-center">
            {message}
          </div>
        )}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalSales}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Rs {totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Course Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
               <LineChart data={courseData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
              <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  className="dark:stroke-gray-200"
                   angle={-30}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis stroke="#6b7280" className="dark:stroke-gray-800 " />
                <Tooltip
                  formatter={(value) => [`Rs ${value.toFixed(2)}`, "Price"]}
                  contentStyle={{
                    backgroundColor: "white",
                    color: "#1f2937",
                  }}
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4a90e2"
                  strokeWidth={3}
                  dot={{ stroke: "#4a90e2", strokeWidth: 2 }}
                  className="dark:stroke-blue-400"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

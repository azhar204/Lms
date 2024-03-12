import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetStudentProgressQuery } from "@/features/api/purchaseApi";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const CheckStudentProgress = () => {
  const userId = useSelector((state) => state.auth.user?._id);
  const { data, isError, isLoading, isFetching,refetch } = useGetStudentProgressQuery(undefined, {
    skip: !userId,
  });
   useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);
  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-700 dark:text-gray-200">
        <Loader className="animate-spin h-16 w-16 text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center">
        Failed to fetch student progress
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center">
        User not authenticated
      </div>
    );
  }

  const { studentProgress = [], message } = data || {};
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Student Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          
          {studentProgress.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center">
              No student progress data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-900 dark:text-gray-200">Name</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Email</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Purchased Course</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Lecture Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentProgress.map((progress) => (
                  <TableRow key={`${progress.userId._id}-${progress.courseId._id}`}>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {progress.userId.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {progress.userId.email || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {progress.courseId.courseTitle || "Unknown Course"}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {progress.completedLectures || 0}/{progress.totalLectures || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckStudentProgress;
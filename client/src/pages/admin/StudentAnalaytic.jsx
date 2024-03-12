import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { Loader } from 'lucide-react';
import  { useEffect, useState } from 'react'

const StudentAnalaytic = () => {
    const [studentProgress,setStudentProgress]= useState([])
    const [loading,setLoading]= useState(true)
    const [error,setError] = useState("")

    useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("http://localhost:8082/api/v1/progress/analytics/students"); 
        setStudentProgress(res.data?.data || []);
      } catch (err) {
        setError("Failed to fetch student analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-700 dark:text-gray-200">
        <Loader className="animate-spin h-16 w-16 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center">
        {error}
      </div>
    );
  }
    
  return (
    <div className='p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors'>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                        Students analytics
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
                  <TableHead className="text-gray-900 dark:text-gray-200">Student</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Email</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Course</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Instructor Email</TableHead>
                  <TableHead className="text-gray-900 dark:text-gray-200">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentProgress.map((progress) => {
                  
                   return (
                    <TableRow
                      key={`${progress.student._id}-${progress.course._id}`}
                    >
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {progress.student.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {progress.student.email || "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {progress.course.title || "Unknown Course"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">
                        {progress.instructor?.email || "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300 ">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            {progress.completedLectures}/{progress.totalLectures}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAnalaytic;
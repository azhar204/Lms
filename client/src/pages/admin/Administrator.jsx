import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";

const Adminstrator = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8082/api/v1/progress/analytics/instructors"); 
      setInstructors(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch instructor analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleBlockInstructor = async (instructorId) => {
    try {
      const res = await axios.put("http://localhost:8082/api/v1/user/blockInstructor", {
        instructorId, 
      });
      alert(res.data.message);
      fetchInstructors(); 
    } catch (err) {
      console.error(err);
      alert(instructorId);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Instructor analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader className="animate-spin h-12 w-12 text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 text-center">{error}</div>
          ) : instructors.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center">
              No instructor data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Courses</TableHead>
                  <TableHead>Course Details</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructors.map((instructor) => (
                  <TableRow key={instructor.instructorId}>
                    <TableCell>{instructor.name}</TableCell>
                    <TableCell>{instructor.email}</TableCell>
                    <TableCell>{instructor.totalCourses}</TableCell>
                    <TableCell>
                      {instructor.courses.map((course) => (
                        <div key={course.courseId}>
                          <strong>{course.title}</strong>: {course.totalEnrolled} students
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleBlockInstructor(instructor.instructorId)}
                        className={`px-3 py-1 rounded text-white ${
                            instructor.isBlocked
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"     
                        }`}
                      >
                        {instructor.isBlocked ? "Unblock" : "Block"}
                      </button>
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

export default Adminstrator;
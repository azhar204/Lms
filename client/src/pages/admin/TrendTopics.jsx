import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, TrendingUp, ArrowUp, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 6;
  const navigate = useNavigate();
  const defaultImage = "/latest_tech_news_cover.jpeg";

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8082/api/v1/reddit/trending`,
          {
            withCredentials: true,
          }
        );
        setTopics(response.data.posts || []);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Please log in to view trending tech topics.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("Failed to load trending tech topics.");
          console.error("Error fetching trending topics:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTopics();
  }, [navigate]);


  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(topics.length / topicsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Trending Tech Topics
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTopics.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No trending tech topics available.
          </p>
        ) : (
          currentTopics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {topic.title}
                </CardTitle>
                <Badge variant="secondary" className="mt-2">
                  r/{topic.subreddit}
                </Badge>
              </CardHeader>
              <CardContent>
                 <img
                  src={topic.thumbnail || defaultImage}
                  alt={topic.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <ArrowUp size={16} />
                    <span>{topic.upvotes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} />
                    <span>{topic.comments}</span>
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full"
                >
                  <a
                    href={topic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <TrendingUp size={16} />
                    View on Reddit
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrendingTopics;
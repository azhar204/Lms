import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
  };

  return (
    // <div
    //   className="relative overflow-hidden py-28 px-4 text-center bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 dark:bg-gradient-to-b dark:from-emerald-900/40 dark:to-black/40"
    // >
    <div
  className="relative overflow-hidden py-28 px-4 text-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 dark:from-gray-950 dark:via-blue-950 dark:to-black"
>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-28 h-28 bg-yellow-300/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-16 right-1/4 w-36 h-36 bg-pink-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-300/20 rounded-full blur-2xl animate-ping"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 className="text-white text-5xl md:text-6xl font-black mb-6 drop-shadow-lg">
          Unlock Your Learning Potential Today
        </h1>

        <p className="text-gray-100 dark:text-gray-300 mb-10 text-xl font-light">
          Master new skills with premium courses taught by industry experts
        </p>

        <form
          onSubmit={searchHandler}
          className="flex items-center bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-2xl mx-auto mb-8 border-2 border-white/30"
        >
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to learn today?"
            className="flex-grow border-none focus-visible:ring-0 px-8 py-4 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg"
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-red-500 dark:bg-gradient-to-r dark:from-orange-600 dark:to-red-600 text-white px-8 py-4 rounded-r-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
          >
            Search
          </Button>
        </form>

        <Button
          onClick={() => navigate(`/course/search?query=`)}
          className="bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 rounded-xl px-10 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 font-bold shadow-lg border-2 border-white/40"
        >
          Browse All Courses
        </Button>
      </motion.div>
    </div>
  );
};

export default HeroSection;
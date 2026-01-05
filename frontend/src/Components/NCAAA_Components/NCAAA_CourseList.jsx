import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useNcaaa } from "../../hooks/useNcaaa";
import { useNavigate } from "react-router";

const NCAAA_CourseList = () => {
   const { ncaaaCourses, ncaaaIsLoading, ncaaaError } = useNcaaa();
   const navigate = useNavigate()

   if (ncaaaIsLoading)
      return (
         <div className="flex items-center justify-center gap-2">
            <CircularProgress size={20} />
            <span>Loading courses...</span>
         </div>
      );

   if (ncaaaError) return <div className="text-red-600 text-center">Error: Failed to fetch courses</div>;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 px-24">
         {ncaaaCourses.map((course) => (
            <div
               className="w-full h-full overflow-hidden bg-green-200 flex flex-col p-4 transition-all duration-200 rounded-xl"
               key={course.course_id}>
               <h3 className="text-xl text-green-800 font-black">{course.course_code}</h3>
               <h1 className="text-2xl text-green-700 font-medium">{course.course_name}</h1>
               <button 
               onClick={() => navigate(`${course.course_code}`)}
               className="text-lg cursor-pointer text-white font-normal w-2/3 py-1 px-2 rounded-lg hover:bg-green-800 bg-green-700 transition-all duration-200 mt-5">
                  Add Course Data
               </button>
            </div>
         ))}
      </div>
   );
};

export default NCAAA_CourseList;

import React from "react";
import { useApi } from "../../hooks/useApi";
import { useNcaaa } from "../../hooks/useNcaaa";

// has problems will fix in future

const AdminDashboard = () => {
   const { ncaaaCourses, error } = useNcaaa();
   let api = useApi();

   return (
      <>
         <div className="p-4 sm:ml-64 border-t-4 border-green-700">
            <div className="">
               {/* TOP 3 BOXES */}
               <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center justify-center h-24 rounded-sm dark:bg-green-200">
                     <select
                        name="courses"
                        id="course_select"
                        className="px-2 py-1 bg-green-700 hover:bg-green-800 cursor-pointer rounded-md text-white">
                        <option value="">-- Select Course --</option>
                        {ncaaaCourses.map((course) => (
                           <option key={course.course_id} value={course.course_id}>
                              {course.course_name}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="flex items-center justify-center h-24 rounded-sm  dark:bg-green-200">
                     <form className="flex gap-2 flex-col">
                        <input type="file" accept=".csv" className="bg-green-300 flex justify-center items-center" />
                        <button
                           type="submit"
                           className="px-3 py-2 bg-green-700 hover:bg-green-800 cursor-pointer rounded-md text-white w-max">
                           Upload
                        </button>
                     </form>
                  </div>

                  <div className="flex items-center justify-center h-24 rounded-sm dark:bg-green-200">
                     <div className={error ? `text-red-500` : `text-green-500`}>{error ? error : "Ready"}</div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

export default AdminDashboard;

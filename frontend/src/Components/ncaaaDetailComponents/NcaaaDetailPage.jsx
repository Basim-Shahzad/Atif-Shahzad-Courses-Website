import React, { useState } from "react";
import { useParams } from "react-router";
import NcaaaStudentResults from "./NcaaaFormTables/NcaaaStudentResults";
import { TabView, TabPanel } from "primereact/tabview";

const NcaaaDetailPage = () => {
   const [activeTab, setActiveTab] = useState("students");

   return (
      <div className="px-24">
         <div className="flex gap-2 mb-4">
            <button className={activeTab === "students" ? "font-bold" : ""} onClick={() => setActiveTab("students")}>
               Students
            </button>

            <button className={activeTab === "results" ? "font-bold" : ""} onClick={() => setActiveTab("results")}>
               Results
            </button>

            <button className={activeTab === "summary" ? "font-bold" : ""} onClick={() => setActiveTab("summary")}>
               Summary
            </button>
         </div>

         {activeTab === "students" && <NcaaaStudentResults />}
         {activeTab === "results" && 'other'}
         {activeTab === "summary" && 'more other'}
      </div>
   );
};

export default NcaaaDetailPage;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Courses from "./Components/CoursesComponents/CoursesPage.jsx";
import AdminPanel from "./Components/AdminComponents/AdminPanel.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import Layout from "./Components/Layout.jsx";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import NCAAA_Page from "./Components/NCAAA_Components/NCAAA_Page.jsx";
import Course from "./Components/CoursesComponents/Course.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { CourseContextProvider } from "./Context/CourseContext.jsx";
import { ResearchContextProvider } from "./Context/ResearchContext.jsx";
import { NcaaaCoursesContextProvider } from "./Context/NcaaCourseContext.jsx";
import AboutPage from "./Components/AboutComponents/AboutPage.jsx";
import AdminPanelNcaaaManagement from "./Components/AdminComponents/AdminPanelNcaaaManagement.jsx";
import FaculityMembersManagement from "./Components/AdminComponents/FaculityMembersManagement.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminDashboard from "./Components/AdminComponents/AdminDashboard.jsx";
import NcaaaDetailPage from "./Components/ncaaaDetailComponents/NcaaaDetailPage.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
   {
      path: "/",
      element: <Layout />,
      errorElement: <div>⚠️ Something went wrong. Please try again later.</div>,
      children: [
         { index: true, element: <App /> },
         { path: "courses", element: <Courses /> },
         {
            path: "admin",
            children: [
               { index: true, element: <AdminDashboard /> },
               { path: "ncaaa-courses", element: <AdminPanelNcaaaManagement /> },
               { path: "faculty", element: <FaculityMembersManagement /> },
            ],
            element: (
               <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
               </ProtectedRoute>
            ),
         },
         { path: "ncaaa", element: <NCAAA_Page /> },
         { path: "ncaaa/:course_code", element: <NcaaaDetailPage /> },
         { path: "course/:course_code", element: <Course /> },
         { path: "about", element: <AboutPage /> },
      ],
   },
]);

createRoot(document.getElementById("root")).render(
   <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
         <AuthProvider>
            <NcaaaCoursesContextProvider>
               <CourseContextProvider>
                  <ResearchContextProvider>
                     <RouterProvider router={router} />
                  </ResearchContextProvider>
               </CourseContextProvider>
            </NcaaaCoursesContextProvider>
         </AuthProvider>
      </QueryClientProvider>
   </PrimeReactProvider>
);

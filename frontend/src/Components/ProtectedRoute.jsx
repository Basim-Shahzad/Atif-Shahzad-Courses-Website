import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole = null, fallback = "/" }) => {
   const { user, AuthLoading, initializing } = useAuth();

   // just for testing and developing
   // const urlParams = new URLSearchParams(window.location.search);
   // const devBypass = urlParams.get('devAdmin');

   // if (process.env.NODE_ENV === 'development' && devBypass) {
   //   return children;
   // }

   if (AuthLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            <span className="ml-3 text-green-600">Loading...</span>
         </div>
      );
   }

   if (!user) {
      return <Navigate to={fallback} replace />;
   }

   if (requiredRole && user.role !== requiredRole) {
      return <Navigate to={fallback} replace />;
   }

   return children;
};

export default ProtectedRoute;

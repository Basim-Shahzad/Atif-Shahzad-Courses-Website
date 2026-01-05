import { useMemo } from "react";
import axios from "axios";

/**
 * Custom hook that provides a configured axios instance for API requests.
 */
export const useApi = () => {
   const API_BASE = import.meta.env.VITE_API_BASE || "/api";
   const isDevelopment = import.meta.env.VITE_ENV === "development" || import.meta.env.DEV;
   const isDebugEnabled = import.meta.env.VITE_DEBUG === "true";

   const api = useMemo(() => {
      const instance = axios.create({
         baseURL: API_BASE,
         headers: {
            "Content-Type": "application/json",
         },
         withCredentials: true,
         timeout: 15000,
      });

      // ✅ Helper function to get cookie value
      const getCookie = (name) => {
         const value = `; ${document.cookie}`;
         const parts = value.split(`; ${name}=`);
         if (parts.length === 2) return parts.pop().split(";").shift();
         return null;
      };

      // ✅ Request interceptor: automatically add CSRF token from cookie
      instance.interceptors.request.use((config) => {
         // Only add CSRF token for state-changing methods
         if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
            const csrfToken = getCookie("csrf_access_token");
            if (csrfToken) {
               config.headers["X-CSRF-TOKEN"] = csrfToken;
            }
         }

         // if (isDevelopment && isDebugEnabled) {
         //    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
         // }

         return config;
      });

      // ✅ Response interceptor for debugging
      if (isDevelopment && isDebugEnabled) {
         instance.interceptors.response.use(
            (response) => {
               return response;
            },
            (error) => {
               const is401 = error.response?.status === 401;
               const isNetworkError = error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED";

               if (isNetworkError) {
                  console.warn(`[API] Cannot reach backend at ${error.config?.url}. Is the server running?`);
               } else if (!is401) {
                  console.error(
                     `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
                     error.response?.status,
                     error.response?.data || error.message
                  );
               }
               return Promise.reject(error);
            }
         );
      }

      // ✅ CSRF token retry interceptor
      instance.interceptors.response.use(
         (response) => response,
         async (error) => {
            const originalRequest = error.config;
            const is403Error = error.response?.status === 403;
            const isCsrfError = error.response?.data?.msg?.includes("CSRF");
            const notRetriedYet = !originalRequest._csrfRetry;

            if (is403Error && isCsrfError && notRetriedYet) {
               originalRequest._csrfRetry = true;

               try {
                  await instance.get("/csrf-token");
                  // Token is now in cookie, next request will pick it up
                  const newToken = getCookie("csrf_access_token");
                  if (newToken) {
                     originalRequest.headers["X-CSRF-TOKEN"] = newToken;
                     return instance(originalRequest);
                  }
               } catch (csrfError) {
                  console.error("❌ CSRF token refresh failed:", csrfError);
               }
            }

            return Promise.reject(error);
         }
      );

      return instance;
   }, [API_BASE, isDevelopment, isDebugEnabled]);

   return api;
};

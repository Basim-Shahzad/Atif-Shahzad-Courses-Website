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

      instance.defaults.xsrfCookieName = "csrf_access_token";
      instance.defaults.xsrfHeaderName = "X-CSRF-TOKEN";

      // ✅ FIXED: Only log unexpected errors in development
      if (isDevelopment && isDebugEnabled) {
         instance.interceptors.request.use((config) => {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
            return config;
         });

         instance.interceptors.response.use(
            (response) => {
               return response;
            },
            (error) => {
               // ✅ DON'T log expected 401 errors (user not logged in)
               const is401 = error.response?.status === 401;
               const isNetworkError = error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED";

               if (isNetworkError) {
                  console.warn(`[API] Cannot reach backend at ${error.config?.url}. Is the server running?`);
               } else if (!is401) {
                  // Only log non-401 errors (401 is expected when not logged in)
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

      // ✅ CSRF token retry interceptor (unchanged)
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
                  const csrfRes = await instance.get("/csrf-token");
                  const token = csrfRes?.data?.csrfToken;

                  if (token) {
                     instance.defaults.headers.common["X-CSRF-TOKEN"] = token;
                     instance.defaults.headers.common["X-XSRF-TOKEN"] = token;
                     instance.defaults.headers.common["X-CSRFToken"] = token;
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

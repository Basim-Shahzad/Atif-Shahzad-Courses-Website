import { useMemo } from "react";
import axios from "axios";

export const useApi = () => {
   const API_BASE = import.meta.env.VITE_API_BASE || "/api";
   const isDevelopment = import.meta.env.VITE_ENV === "development" || import.meta.env.DEV;
   const isDebugEnabled = import.meta.env.VITE_DEBUG === "true";

   const api = useMemo(() => {
      const instance = axios.create({
         baseURL: API_BASE,
         headers: { "Content-Type": "application/json" },
         withCredentials: true,
         timeout: 15000,
      });

      // Debug logging (optional)
      if (isDevelopment && isDebugEnabled) {
         instance.interceptors.request.use((config) => {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
            return config;
         });
      }

      return instance;
   }, [API_BASE, isDevelopment, isDebugEnabled]);

   return api;
};

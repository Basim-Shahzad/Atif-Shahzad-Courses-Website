import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useApi } from "../hooks/useApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const api = useApi();

   const [user, setUser] = useState(null);
   const [initializing, setInitializing] = useState(true);
   const [authLoading, setAuthLoading] = useState(false);

   /* ---------------- INIT ---------------- */
   const initAuth = useCallback(async () => {
      try {
         const res = await api.get("/me");
         setUser(res.data?.user || null);
      } catch {
         setUser(null);
      } finally {
         setInitializing(false);
      }
   }, [api]);

   useEffect(() => {
      initAuth();
   }, [initAuth]);

   /* ---------------- AUTH ACTIONS ---------------- */
   const login = useCallback(
      async (email, password) => {
         setAuthLoading(true);
         try {
            const res = await api.post("/login", { email, password });
            setUser(res.data.user);
            return { success: true };
         } catch (err) {
            return { success: false, error: err.response?.data?.error || "Login failed" };
         } finally {
            setAuthLoading(false);
         }
      },
      [api]
   );

   const register = useCallback(
      async (data) => {
         setAuthLoading(true);
         try {
            const res = await api.post("/register", data);
            setUser(res.data.user);
            return { success: true };
         } catch (err) {
            return { success: false, error: err.response?.data?.error || "Registration failed" };
         } finally {
            setAuthLoading(false);
         }
      },
      [api]
   );

   const logout = useCallback(async () => {
      setAuthLoading(true);
      try {
         await api.post("/logout");
      } catch {
      } finally {
         setUser(null);
         setAuthLoading(false);
      }
   }, [api]);

   const refreshUser = useCallback(async () => {
      try {
         const res = await api.get("/me");
         setUser(res.data?.user || null);
      } catch {
         setUser(null);
      }
   }, [api]);

   /* ---------------- AXIOS 401 HANDLING ---------------- */
   useEffect(() => {
      let refreshing = false;
      let queue = [];

      const processQueue = (error) => {
         queue.forEach((p) => (error ? p.reject(error) : p.resolve()));
         queue = [];
      };

      const interceptor = api.interceptors.response.use(
         (res) => res,
         async (error) => {
            const original = error.config;

            if (error.response?.status === 401 && !original._retry) {
               if (refreshing) {
                  return new Promise((resolve, reject) => queue.push({ resolve, reject })).then(() => api(original));
               }

               original._retry = true;
               refreshing = true;

               try {
                  await api.post("/refresh");
                  processQueue();
                  return api(original);
               } catch (err) {
                  processQueue(err);
                  setUser(null);
                  return Promise.reject(err);
               } finally {
                  refreshing = false;
               }
            }

            return Promise.reject(error);
         }
      );

      return () => api.interceptors.response.eject(interceptor);
   }, [api]);

   /* ---------------- CONTEXT ---------------- */
   const value = useMemo(
      () => ({
         user,
         initializing,
         authLoading,
         login,
         register,
         logout,
         refreshUser,
      }),
      [user, initializing, authLoading, login, register, logout, refreshUser]
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

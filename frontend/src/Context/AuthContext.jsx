import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useApi } from "../hooks/useApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
   const api = useApi();

   const [user, setUser] = useState(null);
   const [initializing, setInitializing] = useState(true);
   const [authLoading, setAuthLoading] = useState(false);

   /* ---------------- CSRF TOKEN MANAGEMENT ---------------- */
   const fetchCsrfToken = useCallback(async () => {
      try {
         await api.get("/csrf-token");
         // Token is now in cookie, axios interceptor will read it
         return true;
      } catch (err) {
         console.error("Failed to fetch CSRF token:", err);
         return false;
      }
   }, [api]);

   /* ---------------- INIT ---------------- */
   const initAuth = useCallback(async () => {
      try {
         // ✅ STEP 1: Get CSRF token first
         await fetchCsrfToken();

         // ✅ STEP 2: Then try to get user (if logged in)
         const res = await api.get("/me");
         setUser(res.data?.user || null);
      } catch {
         setUser(null);
      } finally {
         setInitializing(false);
      }
   }, [api, fetchCsrfToken]);

   useEffect(() => {
      initAuth();
   }, [initAuth]);

   /* ---------------- AUTH ACTIONS ---------------- */
   const login = useCallback(
      async (email, password) => {
         setAuthLoading(true);
         try {
            // ✅ Ensure we have fresh CSRF token before login
            await fetchCsrfToken();

            const res = await api.post("/login", { email, password });
            setUser(res.data.user);
            return { success: true };
         } catch (err) {
            const error = err.response?.data?.error || err.response?.data?.message || "Login failed";
            return { success: false, error };
         } finally {
            setAuthLoading(false);
         }
      },
      [api, fetchCsrfToken]
   );

   const register = useCallback(
      async (data) => {
         setAuthLoading(true);
         try {
            // ✅ Ensure we have fresh CSRF token before register
            await fetchCsrfToken();

            const res = await api.post("/register", data);
            setUser(res.data.user);
            return { success: true };
         } catch (err) {
            const error = err.response?.data?.error || err.response?.data?.message || "Registration failed";
            return { success: false, error };
         } finally {
            setAuthLoading(false);
         }
      },
      [api, fetchCsrfToken]
   );

   const logout = useCallback(async () => {
      setAuthLoading(true);
      try {
         await api.post("/logout");
      } catch (err) {
         // Logout can fail, but we still clear user
         console.error("Logout error:", err);
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

            // ✅ FIXED: Don't try to refresh if user is null (not logged in)
            // Also skip retry for /me and /refresh endpoints themselves
            const isAuthEndpoint = original.url?.includes("/me") || original.url?.includes("/refresh");

            if (error.response?.status === 401 && !original._retry && !isAuthEndpoint && user) {
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
   }, [api, user]);

   /* ---------------- AUTO TOKEN REFRESH ---------------- */
   useEffect(() => {
      if (!user) return;

      // ✅ Refresh access token every 25 minutes (before 30 min expiry)
      const interval = setInterval(async () => {
         try {
            await api.post("/refresh");
         } catch (err) {
            console.warn("⚠️ Auto-refresh failed, user may need to re-login");
         }
      }, 25 * 60 * 1000); // 25 minutes

      return () => clearInterval(interval);
   }, [user, api]);

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
         fetchCsrfToken, // ✅ Export so components can manually refresh CSRF if needed
      }),
      [user, initializing, authLoading, login, register, logout, refreshUser, fetchCsrfToken]
   );

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

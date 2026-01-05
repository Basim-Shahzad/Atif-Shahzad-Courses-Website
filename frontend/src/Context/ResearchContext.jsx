import { createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../hooks/useAuth";

export const ResearchContext = createContext();

export const ResearchContextProvider = ({ children }) => {
   let api = useApi();
   const { initializing } = useAuth();

   const fetchResearches = async () => {
      const response = await api.get("/orcid/researches");
      if (response.data.success) {
         return response.data.researches;
      } else {
         console.error(response.data.error);
      }
   };

   const { isLoading, data, error } = useQuery({
      queryKey: ["researches"],
      queryFn: fetchResearches,
      enabled: initializing,
   });


   const value = {
      researches: data ?? [],
      isLoading,
      error,
   };

   return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
};

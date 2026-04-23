import { createContext, useContext, ReactNode } from "react";

interface DemoContextType {
  isDemoMode: boolean;
}

const DemoContext = createContext<DemoContextType>({ isDemoMode: false });

export const useDemo = () => useContext(DemoContext);

export const DemoProvider = ({ children }: { children: ReactNode }) => (
  <DemoContext.Provider value={{ isDemoMode: true }}>
    {children}
  </DemoContext.Provider>
);

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfileData {
  name: string;
  tradingMethods: string[];       // SMC, ICT, Price Action …
  instruments: string[];          // Forex, Indices, Crypto …
  sessions: string[];             // London, NY AM …
  minConfirmations: number | null;
  accountType: string;            // funded | personal | demo | prop
  experienceYears: string;        // "0-1" | "1-3" | "3-5" | "5+"
  weaknesses: string[];           // multi-select psychological
  riskPerTrade: string;           // "0.5" | "1" | "2" | "3" | "5+"
  // legacy (kept for AI mentor context)
  tradingStyle: string;
}

const defaultProfile: UserProfileData = {
  name: "",
  tradingMethods: [],
  instruments: [],
  sessions: [],
  minConfirmations: null,
  accountType: "",
  experienceYears: "",
  weaknesses: [],
  riskPerTrade: "",
  tradingStyle: "",
};

interface UserProfileContextType {
  userProfile: UserProfileData;
  setUserProfile: (p: UserProfileData) => void;
  updateField: <K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) => void;
  isProfileComplete: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfileState] = useState<UserProfileData>(() => {
    try {
      const stored = localStorage.getItem("UserProfile");
      return stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
    } catch {
      return defaultProfile;
    }
  });

  useEffect(() => {
    localStorage.setItem("UserProfile", JSON.stringify(userProfile));
  }, [userProfile]);

  const setUserProfile = (p: UserProfileData) => setUserProfileState(p);

  const updateField = <K extends keyof UserProfileData>(key: K, value: UserProfileData[K]) => {
    setUserProfileState(prev => ({ ...prev, [key]: value }));
  };

  const isProfileComplete = !!(
    userProfile.tradingMethods.length > 0 &&
    userProfile.accountType &&
    userProfile.weaknesses.length > 0
  );

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, updateField, isProfileComplete }}>
      {children}
    </UserProfileContext.Provider>
  );
};

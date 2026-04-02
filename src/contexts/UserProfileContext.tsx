import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfileData {
  name: string;
  tradingStyle: "smc" | "ict" | "price-action" | "indicators" | "";
  accountType: "funded" | "personal" | "demo" | "";
  weakness: "overtrading" | "fomo" | "cutting-winners" | "moving-sl" | "";
}

const defaultProfile: UserProfileData = {
  name: "",
  tradingStyle: "",
  accountType: "",
  weakness: "",
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

  const isProfileComplete = !!(userProfile.tradingStyle && userProfile.accountType && userProfile.weakness);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile, updateField, isProfileComplete }}>
      {children}
    </UserProfileContext.Provider>
  );
};

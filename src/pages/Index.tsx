import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "./AuthPage";

const Index = () => {
  const { session, loading } = useAuth();

  // Redirect to dashboard if already logged in
  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
};

export default Index;

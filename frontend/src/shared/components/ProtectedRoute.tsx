import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/hooks";
import {LoadingScreen} from "@shared";

export default function ProtectedRoute() {
  const { token, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen/>
  }
  
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/hooks";
import {LoadingScreen} from "@shared";

export default function AnonymousRoute() {
  const { token, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (token) {
    return <Navigate to="/boards" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

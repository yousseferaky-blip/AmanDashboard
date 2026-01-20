import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAllowedRoutes } from "../../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoutes = getAllowedRoutes();

  if (location.pathname === "/") {
    return children;
  }

  if (!allowedRoutes.some((r) => location.pathname.startsWith(r))) {
    return <Navigate to={allowedRoutes[0] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;

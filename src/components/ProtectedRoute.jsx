import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch (e) {
    console.error("localStorage access failed:", e);
  }

  if (!token) {
    // Redirect to login if token is missing
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

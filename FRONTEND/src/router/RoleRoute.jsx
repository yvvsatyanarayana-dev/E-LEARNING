import React from "react";
import { Navigate } from "react-router-dom";
import { getUser, ROLE_REDIRECTS } from "../utils/auth";

export default function RoleRoute({ allowedRoles = [], children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirect = ROLE_REDIRECTS[user.role] || "/";
    return <Navigate to={redirect} replace />;
  }

  return children;
}

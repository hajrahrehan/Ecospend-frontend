import React from "react";
import { Navigate } from "react-router-dom";

const AdminAuthProtected = (props) => {
  const authUser = sessionStorage.getItem("@admintoken");

  if (!authUser) {
    return <Navigate to="/auth" />;
  }

  return <>{props.children}</>;
};

export { AdminAuthProtected };

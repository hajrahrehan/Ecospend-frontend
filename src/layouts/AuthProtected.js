import React from "react";
import { Navigate } from "react-router-dom";

const AuthProtected = (props) => {
  const authUser = sessionStorage.getItem("@token");

  if (!authUser) {
    return <Navigate to="/auth" />;
  }

  return <>{props.children}</>;
};

export { AuthProtected };

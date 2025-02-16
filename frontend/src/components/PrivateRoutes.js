import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

const PrivateRoutes = ({ children }) => {
  const { user } = useAuth();
  console.log("PrivateRoutes user:", user);
  return user ? children : <Navigate to="/authentication/sign-in" replace />;
};

PrivateRoutes.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoutes;

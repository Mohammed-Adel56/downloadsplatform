import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { SignupContext } from "../context/SignupContext";

const PrivateForgetRoute = ({ children }) => {
  const { userData } = useContext(SignupContext);

  // Check if user came from register page (has email)
  const isFromRegister = userData?.email;
  const isFromRegisterotp = userData?.otpString;

  if (!isFromRegister) {
    // Redirect to register if no email in context
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateForgetRoute;

import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { SignupContext } from "../context/SignupContext";

const PrivateVerifyRoute = ({ children }) => {
  const { userData } = useContext(SignupContext);

  // Check if user came from register page (has email)
  const isFromRegister = userData?.email;
  const isFromRegisterpass = userData?.password;
  // const isFromRegisterotp = userData?.otpString;

  if (!isFromRegister && !isFromRegisterpass) {
    // Redirect to register if no email in context
    return <Navigate to="/register" replace />;
  }

  return children;
};

export default PrivateVerifyRoute;

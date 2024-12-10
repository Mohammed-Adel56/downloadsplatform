
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { SignupContext } from "../context/SignupContext";

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useContext(SignupContext);
    if(!isAuthenticated){
        return <Navigate to="/" />; // Redirect to home if not admin
    }

    // Check if the user is authenticated and is an admin
    if (!isAuthenticated && !isAdmin) {
        return <Navigate to="/" />; // Redirect to home if not admin
    }


    return children; // Render the protected component
};

export default AdminRoute;
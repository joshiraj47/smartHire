import {Route, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {useAuth} from "../../auth/AuthProvider.jsx";

export const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (!allowedRoles.includes(user.userRole)) {
            navigate('/');
        }
    }, [navigate, user, allowedRoles]);

    // If user is authenticated and has the right role, render the children
    return user && user.userRole && allowedRoles.includes(user.userRole) ? children : null;
};

import {createContext, useContext, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {useLocalStorage} from "../customHooks/UseLocalStorage.jsx";
import {getUserDetails} from "../query/apiRequests.jsx";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useLocalStorage("user", null);
    const navigate = useNavigate();

    const login = async () => {
        const userData = await getUserDetails();
        setUser(userData.data);
        setTimeout(() => navigate('/'), 1000)
    }

    const logout = () => {
        setUser(null);
        navigate('/login');
        return Promise.resolve();
    }

    const value = useMemo(() => ({
        user,
        login,
        logout
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

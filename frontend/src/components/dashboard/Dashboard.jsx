import {useAuth} from "../../auth/AuthProvider.jsx";
import {UserRoles} from "../../constants/globalConstants.jsx";
import {FreelancerDashboard} from "./FreelancerDashboard.jsx";
import {useNavigate} from "react-router-dom";
import {EmployerDashboard} from "./EmployerDashboard.jsx";

export const Dashboard = () => {
    const {user} = useAuth();
    const userRole = user.userRole;
    const navigate = useNavigate();

    switch (userRole) {
        case UserRoles.FREELANCER:
            return <FreelancerDashboard />;
        case UserRoles.EMPLOYER:
            return <EmployerDashboard />;
        default:
            return navigate('/login');
    }
}

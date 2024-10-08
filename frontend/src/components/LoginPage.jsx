import {Login} from "./login/Login.jsx";
import {UserRoles} from "../constants/globalConstants.jsx";

export const LoginPage = () => {
    return (
        <>
            <div className='flex vh-100 align-items-center bg-body-tertiary'>
                <Login userRole={UserRoles.EMPLOYER}></Login>
                <div className='bg-gray-400 h-75 w-1'></div>
                <Login userRole={UserRoles.FREELANCER}></Login>
            </div>
        </>
    )
}

import {useState} from "react";
import {isEmpty} from "lodash/fp";
import {useMutation} from "@tanstack/react-query";
import {loginUserRequest} from "../../query/apiRequests.jsx";
import {useAuth} from "../../auth/AuthProvider.jsx";
import {UserRoles} from "../../constants/globalConstants.jsx";

export const Login = ({userRole}) => {
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const {login} = useAuth();

    const {mutate, isPending, isSuccess, isError} = useMutation({
        mutationFn: loginUserRequest,
        onSuccess: () => login()
    });
    function shouldDisableLogin() {
        return [email, password].some((attr) => isEmpty(attr)) || isPending || isSuccess;
    }
    function loginUser(e) {
        e.preventDefault();
        mutate({email, password, userRole});
    }
    function checkingLogin() {
        return <div
            className="d-flex justify-content-center align-items-center mb-0 mt-1"
            role="alert">
            <span className="spinner-border spinner-border-sm" role="status"></span>
            <span className="p-2">Checking login...</span>
        </div>
    }
    function showLoginFailedElement() {
        return <div className="alert alert-danger d-flex align-items-center mb-0 mt-3" role="alert">
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
                <use xlinkHref="#exclamation-triangle-fill"/>
            </svg>
            <div>
                Login Failed. Incorrect email or password!
            </div>
        </div>
    }
    return (
        <>
            <div className="w-50 h-full gradient-custom">
                <div className="container py-2 h-100">
                    <div className="row d-flex justify-content-center align-items-center h-100">
                        <div className="col-12 col-md-8 col-lg-8 col-xl-8">
                            <div className="card bg-white text-black" style={{borderRadius: "1rem"}}>
                                <div className="card-body p-5 text-center">
                                    <div className="mt-md-4 pb-4">
                                        <h2 className="fw-bold mb-2 text-decoration-underline text-xl text-uppercase">
                                            {
                                                userRole === UserRoles.EMPLOYER ? 'Employer' : 'Freelancer'
                                            }
                                        </h2>
                                        <p className="text-black-50 mb-2">Please enter your email and password!</p>

                                        <div data-mdb-input-init="" className="form-outline form-white mb-4">
                                            <input type="email" id="typeEmailX" placeholder="Email" value={email}
                                                   onChange={(e) => setEmail(e.target.value)}
                                                   className="form-control form-control-md"/>
                                        </div>

                                        <div data-mdb-input-init="" className="form-outline form-white mb-4">
                                            <input type="password" id="typePasswordX" placeholder="Password"
                                                   value={password}
                                                   onChange={(e) => setPass(e.target.value)}
                                                   className="form-control form-control-md"/>
                                        </div>

                                        <button data-mdb-button-init="" data-mdb-ripple-init=""
                                                disabled={shouldDisableLogin()}
                                                onClick={loginUser}
                                                className="btn btn-primary btn-sm px-4" type="submit">
                                            Log In
                                        </button>

                                        {
                                            isPending && checkingLogin()
                                        }
                                        {
                                            isError && showLoginFailedElement()
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

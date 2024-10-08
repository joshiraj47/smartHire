import {BrowserRouter, Route, Routes} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import {AuthProvider} from "./auth/AuthProvider.jsx";
import {RootLayout} from "./components/RootLayout.jsx";
import {ProtectedRoute} from "./components/protected/ProtectedRoute.jsx";
import {LoginPage} from "./components/LoginPage.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.min.css';
import {UserRoles} from "./constants/globalConstants.jsx";
import {Dashboard} from "./components/dashboard/Dashboard.jsx";
import axios from "axios";
import {Userprofile} from "./components/userProfile/Userprofile.jsx";

axios.defaults.baseURL = import.meta.env.REACT_APP_NODE_ENV === 'PRODUCTION' ? 'https://gojira-backend.onrender.com' : 'http://localhost:4000';
axios.defaults.withCredentials = true;
axios.defaults.credentials = 'include';

const queryClient = new QueryClient();
function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <ToastContainer autoClose={4000} hideProgressBar={true}/>
          <BrowserRouter>
              <AuthProvider>
                  <Routes>
                      <Route path="/" element={<RootLayout/>}>
                          <Route
                              path="/"
                              element={
                                  <ProtectedRoute allowedRoles={[UserRoles.EMPLOYER, UserRoles.FREELANCER]}>
                                      <Dashboard />
                                  </ProtectedRoute>
                              }
                          />
                          <Route
                              path="/profile"
                              element={
                                  <ProtectedRoute allowedRoles={[UserRoles.FREELANCER]}>
                                      <Userprofile />
                                  </ProtectedRoute>
                              }
                          />
                          <Route path="login" element={<LoginPage/>} />
                      </Route>
                  </Routes>
              </AuthProvider>
          </BrowserRouter>
      </QueryClientProvider>
  )
}

export default App

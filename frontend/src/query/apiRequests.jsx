import axios from "axios";
import {toast} from "react-toastify";

const loginUserRequest = async ({email, password, userRole}) => {
    const login = axios.post('/login', {
        email,
        password,
        userRole
    });
    return await toast.promise(
        login,
        {
            success: 'Login successful',
        },
        {pauseOnHover: false}
    )
}

const getUserDetails = async () => {
    return await axios.get('/user-details');
}

const getGithubRepos = async ({queryKey}) => {
    const response = await axios.get(`https://api.github.com/users/${queryKey[1]}/repos`, {withCredentials: false});
    return response.data;
}

const getUserProfile = async () => {
    return await axios.get('/user-profile');
}

const saveProfileDetails = async ({userId, skills, githubUsername}) => {
    const saveProfile = axios.put(`/update-profile/${userId}`, {
        skills,
        githubUsername,
    });
    return await toast.promise(
        saveProfile,
        {
            success: 'Profile updated successfully',
        },
        {pauseOnHover: false}
    )
}

const fetchEmployerJobs = async () => {
    return await axios.get('/employer-jobs');
}

const fetchAllJobs = async ({pageNum, limit, salary, tags}) => {
    return await axios.get(`/jobs?pageNum=${pageNum}&limit=${limit}&salary=${salary}&tags=${tags}`);
}

const postEmployerJob = async (payload) => {
    return await axios.post('/post-job', payload)
}

const fetchJobApplicants = async (jobId) => {
    return await axios.post('/job-applicants', {jobId});
}

export {
    loginUserRequest,
    getUserDetails,
    getGithubRepos,
    getUserProfile,
    saveProfileDetails,
    fetchEmployerJobs,
    postEmployerJob,
    fetchJobApplicants,
    fetchAllJobs
}

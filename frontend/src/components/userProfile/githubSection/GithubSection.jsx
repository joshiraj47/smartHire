import React, {useEffect, useState} from 'react';
import {useMutation, useQuery} from "@tanstack/react-query";
import {getGithubRepos, getUserProfile, saveProfileDetails} from "../../../query/apiRequests.jsx";
import {useAuth} from "../../../auth/AuthProvider.jsx";
import {useNavigate} from "react-router-dom";
export const GithubSection = () => {
    const [githubUsername, setGithubUsername] = useState('');
    const [skills, setSkills] = useState([]);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const availableSkills = ['React', 'Angular', 'Vue', 'Node.js', 'Python', 'JavaScript'];
    const {user} = useAuth();
    const navigate = useNavigate();

    const {data: repos, isFetching, isSuccess, refetch: fetchGitRepos, isError} = useQuery({queryKey: ["repos", githubUsername], queryFn: getGithubRepos, enabled: false});
    const {mutate: saveProfile, isPending, isError: saveProfileError} = useMutation({mutationFn: saveProfileDetails, enabled: false, onSuccess: (data) => setUpdatedProfileDetails(data?.data?.profile)});
    const {mutate: getUserProfileMutate, isPending: fetchingUserProfile, isError: fetchProfileError, isSuccess: fetchProfileSuccess} = useMutation({mutationFn: getUserProfile, enabled: false, onSuccess: (data) => setProfileDetails(data?.data?.profile)});


    useEffect(() => {
        getUserProfileMutate();
    }, []);

    const setProfileDetails = (updatedProfile) => {
        setGithubUsername(updatedProfile.githubUsername);
        setSkills(updatedProfile.skills?.split(','));
    }

    const setUpdatedProfileDetails = (updatedProfile) => {
        setProfileDetails(updatedProfile);
        return navigate('/');
    }

    // Form validation
    const validateForm = () => {
        if (!githubUsername) {
            setError('GitHub projects are required. Enter GitHub username to fetch some!');
            return false;
        }
        if (skills.length === 0) {
            setError('At least one skill must be selected');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched(true);

        if (validateForm()) {
            saveProfile({userId: user.userId, skills: skills.join(','), githubUsername});
        }
    };

    // Handle adding skills
    const handleAddSkill = (skill) => {
        setSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    return (
        <div className="max-w-screen-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Freelancer Profile</h1>

            <form onSubmit={handleSubmit}>
                {/* Skills Section */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Select Skills:</label>
                    {
                        fetchingUserProfile &&
                        <div className='flex flex-wrap'>
                            Fetching user profile...
                        </div>
                    }
                    {
                        fetchProfileError &&
                        <div className="text-red-500 mb-4">
                            Error fetching user profile...
                        </div>
                    }
                    {
                        fetchProfileSuccess &&
                        <div className="flex flex-wrap gap-2">
                            {availableSkills.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    className={`px-3 py-2 rounded-full border ${
                                        skills.includes(skill) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={() => handleAddSkill(skill)}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    }

                </div>

                {/* GitHub Username Section */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">GitHub Username:</label>
                    <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        placeholder="Enter GitHub username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <button type='button' className='btn btn-primary btn-sm bg-blue-500 mt-2' disabled={!githubUsername} onClick={fetchGitRepos}>Fetch Projects</button>
                </div>

                {/* Repos Section */}
                {isFetching && <p className="text-gray-500">Fetching GitHub Projects...</p>}
                {isError && <p className="text-red-500">{error}</p>}
                {!isFetching && !isError && repos?.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-lg font-bold mb-2">Projects:</h3>
                        <ul className="list-disc ml-5">
                            {repos.map((repo) => (
                                <li key={repo.id}>
                                    <a href={repo.html_url} target="_blank"
                                       className="text-blue-500">
                                        {repo.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Error Display */}
                {touched && error && <p className="text-red-500 mb-4">{error}</p>}


                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600"
                        disabled={isPending || fetchingUserProfile || fetchProfileError}
                    >
                        Save Profile
                    </button>
                    {saveProfileError && <p className="text-red-500 mt-2 mb-4">Failed to update profile. Please try again...</p>}
                </div>
            </form>
        </div>
    );
};

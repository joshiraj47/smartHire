import React, {useEffect, useState} from 'react';
import {useMutation, useQuery} from "@tanstack/react-query";
import {fetchEmployerJobs, postEmployerJob} from "../../query/apiRequests.jsx";
import {useNavigate} from "react-router-dom";
import {JobCard} from "../job/JobCard.jsx";

const postJob = async (jobData) => {
    const { data } = await postEmployerJob({jobData});
    return data;
};
export const EmployerSection = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [tags, setTags] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [salary, setSalary] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const {data, isLoading, refetch: fetchJobs, isError } = useQuery({queryKey: ["jobs"], queryFn: fetchEmployerJobs, enabled: false});
    const {mutate: postJobMutate, isPending, isSuccess, isError: postJobError} = useMutation({mutationFn: postJob, enabled: false,
        onError: () => {
            setError('Error posting the job. Please try again...');
        },
        onSuccess: (data) => navigate('/')});

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!jobDescription || !jobTitle || !companyName || !contactInfo) {
            setError('All fields are required.');
            return;
        }

        const data = {
            jobDescription: jobDescription,
            jobTitle: jobTitle,
            tags: tags,
            companyName: companyName,
            contactInfo: contactInfo,
            salary: salary
        };

        postJobMutate(data);
    };

    return (
        <div className="max-w-screen-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Job Title:</label>
                    <textarea
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Enter job title"
                        className="w-full px-2 py-2 border border-gray-300 rounded-md"
                        rows="1"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Job Description:</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Enter job description"
                        className="w-full px-2 py-2 border border-gray-300 rounded-md"
                        rows="4"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tags:</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags separated by commas"
                        className="w-full px-2 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Salary:</label>
                    <input
                        type="number"
                        value={salary}
                        min={0}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="Enter salary"
                        className="w-full px-2 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter your company name"
                        className="w-full px-2 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Contact Info:</label>
                    <input
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Enter contact information"
                        className="w-full px-2 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600"
                    >
                        Post Job
                    </button>
                </div>
            </form>

            <h2 className="text-xl font-bold mt-8 mb-4">Posted Jobs</h2>
            {isLoading && <p className="text-gray-500">Loading jobs...</p>}
            {isError && <p className="text-red-500">Error fetching jobs.</p>}
            { data?.data?.jobs && data?.data?.jobs.length > 0 ? (
                <div className="gap-4 grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-4 mx-auto">
                    {data?.data?.jobs.map((job) => (
                        <div key={job.jobId} className="relative">
                            <JobCard job={job}/>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading && !data?.data?.jobs?.length &&
                <p>No jobs posted yet.</p>
            )}
        </div>
    );
};

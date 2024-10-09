import React from "react";
import {useAuth} from "../../auth/AuthProvider.jsx";
import {UserRoles} from "../../constants/globalConstants.jsx";
import {ViewApplicants} from "../applicants/ViewApplicants.jsx";
import {useMutation} from "@tanstack/react-query";
import {applyJob} from "../../query/apiRequests.jsx";

export const JobCard = ({job, onApplyJob}) => {
    const {user} = useAuth();

    const {mutate: applyJobMutate, isPending} = useMutation({mutationFn: applyJob, enabled: false,
        onSuccess: (data) => onApplyJob(data?.data?.job)});
    const applyForJob = (jobId) => {
        applyJobMutate({jobId});
    }

    return (
        <>
            <div
                className="max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-800 line-clamp-2 overflow-y-auto">{job.jobTitle}</h2>
                    <h3 className="text-md text-gray-600">{job.companyName}</h3>
                    <div
                        className="mt-2 text-gray-700 h-[200px] overflow-y-auto border border-gray-100 rounded-md p-1.5 break-words">
                        {job.jobDescription}
                    </div>
                    <div className="mt-3">
                        <h4 className="font-semibold text-gray-800 mb-2">Tags:</h4>
                        <div className="flex flex-wrap max-h-[100px] overflow-y-auto">
                            {job.jobTags?.split(',').map((tag, index) => (
                                <span key={index}
                                      className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">
                                {tag}
                            </span>
                            ))}
                        </div>
                    </div>
                    <div className='flex justify-around items-center'>
                        <div className="mt-2 flex items-center">
                            <h4 className="font-semibold text-gray-800">Salary:</h4>
                            <span
                                className="text-gray-700 pl-1.5">{job.salary}</span>
                        </div>
                        <div className="mt-2 pl-2 flex items-center">
                            <h4 className="font-semibold text-gray-800">Applications:</h4> <span
                                className="text-gray-700 pl-1.5">{job.applicationsCount}</span>
                        </div>
                    </div>
                </div>
                <div className="flex justify-around items-center p-3 border-t border-gray-200">
                    {
                        user && user.userRole === UserRoles.FREELANCER &&
                        <button
                            type='button'
                            disabled={job.hasApplied || isPending}
                            className='btn btn-primary btn-md bg-blue-500'
                            onClick={() => applyForJob(job.jobId)}
                        >
                            {
                                job.hasApplied ? <span>Applied</span> : isPending ? <span>Applying</span> : <span>Apply Now</span>
                            }
                        </button>
                    }
                    {
                        user && user.userRole === UserRoles.EMPLOYER &&
                        <ViewApplicants jobId={job.jobId}/>
                    }
                </div>
            </div>
        </>
    )
}

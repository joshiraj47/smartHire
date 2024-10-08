import React from "react";

export const JobCard = ({job}) => {
    return (
        <>
            <div
                className="max-w-xs mx-auto bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-800">{job.jobTitle}</h2>
                    <h3 className="text-lg text-gray-600">{job.companyName}</h3>
                    <div className="mt-2 text-gray-700 max-h-[200px] overflow-hidden overflow-y-auto border border-gray-200 rounded-md p-1.5 break-words">
                        {job.jobDescription}
                    </div>
                    <div className="mt-3">
                        <h4 className="font-semibold text-gray-800 mb-2">Tags:</h4>
                        <div className="flex flex-wrap">
                            {job.jobTags?.split(',').map((tag, index) => (
                                <span key={index}
                                      className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">
                                {tag}
                            </span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-gray-600">Applications: <span
                            className="font-bold">{job.applicationsCount}</span></p>
                    </div>
                </div>
                <div className="flex justify-around items-center p-3 border-t border-gray-200">
                    <button
                        className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded-lg px-4 py-2">
                        Apply Now
                    </button>
                    <a href={`/applicants/${job.id}`} className="text-blue-500 hover:underline">
                        View Applicants
                    </a>
                </div>
            </div>
        </>
    )
}

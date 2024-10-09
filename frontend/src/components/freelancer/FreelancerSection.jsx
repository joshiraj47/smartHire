import {fetchAllJobs} from "../../query/apiRequests.jsx";
import React, {useCallback, useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {pageLimit} from "../../constants/globalConstants.jsx";
import {JobCard} from "../job/JobCard.jsx";
import {CustomPagination} from "../common/CustomPagination.jsx";
import {JobFilter} from "./JobFilter.jsx";

export const FreelancerSection = () => {
    const [jobs, setJobs] = useState(null);
    const [jobsMetadata, setJobsMetadata] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [appliedFilter, setAppliedFilter] = useState({});

    const {isSuccess, isPending, isError, mutate: fetchJobs} = useMutation({ mutationKey: ["dashboardJobs"], mutationFn: fetchAllJobs, enabled: false, onSuccess: (data) => {
            setJobs(data?.data?.jobs);
            setJobsMetadata(data?.data?.metadata);
        }});

    useEffect(() => {
        fetchJobs({pageNum: pageNum, limit: pageLimit, tags: appliedFilter.skills, salary: appliedFilter.salary});
    }, [pageNum, fetchJobs, appliedFilter]);

    const onFilterApply = (filter) => {
        setAppliedFilter(filter);
    }

    const onApplyJob = (updatedJob) => {
        const currentJobs = [...jobs];
        const updatedJobs = currentJobs.map(job => job.jobId === updatedJob.jobId ? {...job, ...updatedJob} : job);
        setJobs(updatedJobs);
    }


    const handlePageChange = useCallback((val) => {
        setPageNum(val);
    }, []);

    return (
        <div className='max-w-screen-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md'>
            <div className="pb-3 flex justify-end">
                <JobFilter onFilterApply={onFilterApply}/>
            </div>

            {
                isSuccess &&
                (jobs?.length ?
                    <div className="gap-4 grid grid-flow-row-dense md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mx-auto">
                        {jobs.map((job) => (
                            <div key={job.jobId} className="relative">
                                <JobCard job={job} onApplyJob={onApplyJob}/>
                            </div>
                        ))}
                    </div> :
                    <div>No jobs posted yet.</div>
                )
            }
            {
                isPending &&
                <div className="text-gray-500">Fetching jobs...</div>
            }
            {
                isError &&
                <div className="text-red-500">Error fetching jobs.</div>
            }

            {
                jobsMetadata?.totalPages &&
                (
                    <div className='d-flex mt-4 justify-content-center'>
                        <CustomPagination currentPage={pageNum} totalPages={jobsMetadata?.totalPages} onPageChange={handlePageChange}></CustomPagination>
                    </div>
                )
            }
        </div>
    )
}

import React, {useEffect, useState} from 'react';
import { Modal, Button } from 'react-bootstrap';
import {useMutation, useQuery} from "@tanstack/react-query";
import {fetchJobApplicants, getGithubRepos} from "../../query/apiRequests.jsx";

export const ApplicantsModal = ({jobId, show, handleClose }) => {
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [applicants, setApplicants] = useState(null);
    const [fetchApplicantError, setFetchApplicantError] = useState(null);
    const {mutate: fetchApplicantsMutate, isPending, isSuccess: fetchedApplicants, isError } = useMutation({mutationFn: fetchJobApplicants, enabled: false,
        onError: () => {
            setFetchApplicantError('Error fetching applicants. Please try again...');
        },
        onSuccess: (data) => setApplicants(data?.data?.applicants)});
    const {data: repos, isFetching, isSuccess, refetch: fetchGitRepos, isError: fetchGithubError} = useQuery({queryKey: ["repos", selectedApplicant?.githubUsername], queryFn: getGithubRepos, enabled: false});

    useEffect(() => {
        fetchApplicantsMutate(jobId);
    }, []);

    useEffect(() => {
        if (selectedApplicant) {
            fetchGitRepos();
        }
    }, [selectedApplicant]);

    const handleApplicantClick = (applicant) => {
        setSelectedApplicant(applicant);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Applicants</Modal.Title>
            </Modal.Header>
            <Modal.Body className="flex">
                <div className="w-1/3 border-r pr-4">
                    {isPending && <p>Loading applicants...</p>}
                    {isError && <p className='text-red-500 mt-2 mb-4'>Error loading applicants.</p>}
                    {fetchedApplicants &&
                    applicants?.length > 0 && (
                            <ul className="mt-2 max-h-[400px]">
                                {applicants.map((applicant) => (
                                    <li
                                        key={applicant.userId}
                                        className={`cursor-pointer border rounded-sm p-2 ${selectedApplicant?.userId === applicant.userId ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-200'}`}
                                        onClick={() => handleApplicantClick(applicant)}
                                    >
                                        <div>
                                            {applicant.name}
                                        </div>
                                    </li>


                                ))}
                            </ul>
                        )}
                    {
                        fetchedApplicants &&
                        (!applicants || !applicants.length) &&
                        (
                            <p>No applicants found.</p>
                        )
                    }
                </div>
                <div className="w-2/3 pl-4">
                    {selectedApplicant ? (
                        <div>
                            {isFetching &&
                                <p>Loading GitHub profile...</p>
                            }
                            {
                                isSuccess &&
                                <div className="mt-4">
                                    <h1 className="text-lg font-semibold">{selectedApplicant.name}</h1>
                                    <h4 className="mt-3">Skills:</h4>
                                    <div className="flex flex-wrap gap-2 mt-2 max-h-[200px] overflow-y-auto">
                                        {selectedApplicant.skills?.split(',').map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-3 py-2 text-sm rounded-full border bg-blue-500 text-white"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <h4 className="mt-4">Repositories:</h4>
                                    <ul className="list-disc mt-2 ml-5">
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
                            }
                            {
                            fetchGithubError &&
                                <p>No public repositories found.</p>
                            }
                        </div>
                    ) : (
                        <p>Select an applicant to see their GitHub profile.</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

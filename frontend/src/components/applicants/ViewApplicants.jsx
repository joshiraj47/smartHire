import {Suspense, useState} from "react";
import {ApplicantsModal} from "./ApplicantsModal.jsx";
import {Spinner} from "react-bootstrap";

export const ViewApplicants = ({jobId}) => {
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    return (
        <>
            <button className="text-blue-500 hover:underline" onClick={() => setShowApplicantsModal(true)}>View Applicants
            </button>
            {showApplicantsModal && (
                <Suspense fallback={<Spinner animation="border" variant="primary" />}>
                    <ApplicantsModal jobId={jobId} show={showApplicantsModal} handleClose={() => setShowApplicantsModal(false)}/>
                </Suspense>
            )}
        </>
    )
}

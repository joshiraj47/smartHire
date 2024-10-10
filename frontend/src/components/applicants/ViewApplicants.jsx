import React, {Suspense, useState} from "react";
const LazyModal = React.lazy(() => import('./ApplicantsModal.jsx'));
import {Spinner} from "react-bootstrap";

export const ViewApplicants = ({jobId}) => {
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    return (
        <>
            <button className="text-blue-500 hover:underline" onClick={() => setShowApplicantsModal(true)}>View Applicants
            </button>
            {showApplicantsModal && (
                <Suspense fallback={<Spinner animation="border" variant="primary" />}>
                    <LazyModal jobId={jobId} show={showApplicantsModal} handleClose={() => setShowApplicantsModal(false)}/>
                </Suspense>
            )}
        </>
    )
}

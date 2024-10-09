import React, {useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import {getUserProfile} from "../../query/apiRequests.jsx";

export const JobFilter = ({onFilterApply}) => {
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [userSkills, setUserSkills] = useState('');
    const [selectedSalary, setSelectedSalary] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {mutate: getUserProfileMutate} = useMutation({mutationFn: getUserProfile, enabled: false, onSuccess: (data) => setProfileDetails(data?.data?.profile)});

    const setProfileDetails = (updatedProfile) => {
        setUserSkills(updatedProfile.skills?.split(','));
    }

    const handleToggleDropdown = () => {
        if (!isDropdownOpen && !userSkills) {
            getUserProfileMutate();
        }
        setIsDropdownOpen((prev) => !prev);
    };

    const handleSkillChange = (skill) => {
        setSelectedSkills((prev) => {
            if (prev.includes(skill)) {
                return prev.filter((s) => s !== skill);
            }
            return [...prev, skill];
        });
    };

    const applyFilters = () => {
        setIsDropdownOpen(false);
        onFilterApply({ skills: selectedSkills, salary: selectedSalary });
    };

    const clearFilters = () => {
        setSelectedSkills([]);
        setSelectedSalary(0);
        setIsDropdownOpen(false)
        onFilterApply({ skills: null, salary: null });
    };


    return (
        <div className="relative">
            <button
                onClick={handleToggleDropdown}
                className="btn btn-primary btn-sm"
            >
                {isDropdownOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            {isDropdownOpen && (
                <div className="absolute z-10 mt-2 rounded-md bg-white shadow-lg right-0">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">Select Skills:</h3>
                        {userSkills && userSkills.map((skill) => (
                            <div key={skill}>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedSkills?.includes(skill)}
                                        onChange={() => handleSkillChange(skill)}
                                        className="mr-2"
                                    />
                                    {skill}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-2">
                        <h3 className="text-lg font-semibold">Enter Salary:</h3>
                        <input
                            type="number"
                            value={selectedSalary}
                            onChange={(e) => setSelectedSalary(e.target.value)}
                            placeholder="Enter salary"
                            className="border border-gray-300 rounded-md p-2 w-full"
                        />
                    </div>
                    <div className="flex justify-end p-4">
                        <button
                            onClick={clearFilters}
                            className="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md mr-2"
                        >
                            Clear
                        </button>
                        <button
                            onClick={applyFilters}
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

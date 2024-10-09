const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const UserModel = require("./models/User");
const UserProfileModel = require("./models/UserProfile");
const JobModel = require("./models/Job");
const CounterModel = require("./models/Counter");
const JobApplicantModel = require("./models/JobApplicant");
const _ = require("lodash/fp");
require('dotenv').config();

const app = express();

const jwtSecret = 'test1213Secret65754Key';
const PORT = process.env.PORT || 4000;
const ENVIRONMENT = process.env.NODE_ENV;

app.use(express.json());
app.use(cookieParser());

if (ENVIRONMENT === 'PRODUCTION') {
    app.use(cors({
        credentials: true,
        origin: 'https://smarthire-ui.vercel.app',
        methods: ["POST", "GET", "PUT","DELETE","OPTIONS"]
    }));
} else {
    app.use(cors({
        credentials: true,
        origin: 'http://localhost:5173',
        methods: ["POST", "GET", "PUT","DELETE","OPTIONS"]
    }));
}

mongoose.connect(process.env.MONGO_URL);

const getNextSequence = async (sequenceName) => {
    const sequenceDocument = await CounterModel.findByIdAndUpdate(
        { _id: sequenceName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return sequenceDocument.seq;
};

app.get("/", (req, res) => {
    res.json('backend running fine');
});

app.post("/login", async (req, res) => {
    const {email, password, userRole} = req.body;
    return UserModel.findOne({email: email, userRole: userRole})
        .then((userDoc) => {
            const isPassCorrect =  bcrypt.compareSync(password, userDoc.password);
            if (isPassCorrect) {
                jwt.sign({id: userDoc._id, email: userDoc.email, userId: userDoc.userId}, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    if (ENVIRONMENT === 'PRODUCTION') {
                        return res
                            .cookie("token", token, { withCredentials: true, sameSite: "none", secure: true, httpOnly: true })
                            .json("success");
                    } else {
                        return res
                            .cookie("token", token, { withCredentials: true, sameSite: "lax", secure: false, httpOnly: true })
                            .json("success");
                    }
                });
            } else throw new Error();
        })
        .catch((err) => res.status(401).send(err.errorResponse));
});

app.get('/user-details', checkCookieTokenAndReturnUserData, async (req, res) => {
    const {name, email, userId, userRole} = await UserModel.findById(req.userData.id);
    res.json({name, email, userId, userRole});
});

app.get('/user-profile', checkCookieTokenAndReturnUserData, async (req, res) => {
    return UserProfileModel.findOne({userId: req.userData.userId}, {skills: 1, githubUsername: 1})
        .then((profile) => {
            return res.json({profile: {skills: profile.skills, githubUsername: profile.githubUsername}});
        });
});

app.put("/update-profile/:userId", checkCookieTokenAndReturnUserData, async (req, res) => {
    const userId = req.params.userId;
    const {skills, githubUsername} = req.body;
    return UserProfileModel.findOneAndUpdate({userId: userId}, {$set: {skills, githubUsername}}, { returnOriginal: false, upsert: true })
        .then((updatedProfile) => {
            return res.json({profile: {skills: updatedProfile.skills, githubUsername: updatedProfile.githubUsername}});
        })
        .catch((err) => {
            res.status(409).send(err);
        });
});

app.get('/employer-jobs', checkCookieTokenAndReturnUserData, async (req, res) => {
    return JobModel.find({employerId: req.userData.userId})
        .then(async (jobs) => {
            let updatedJobs = [];
            const val = jobs?.reduce((prev, currentValue) => {
                return prev.then(() => {
                    return new Promise(async (resolve) => {
                        const filterQuery = {jobId: currentValue.jobId};
                        const totalApplicantsCount = await JobApplicantModel.countDocuments(filterQuery);
                        const updatedJob = {
                            jobId: currentValue.jobId,
                            jobTitle: currentValue.jobTitle,
                            jobDescription: currentValue.jobDescription,
                            jobTags: currentValue.jobTags,
                            companyName: currentValue.companyName,
                            contact: currentValue.contact,
                            applicationsCount: totalApplicantsCount,
                            salary: currentValue.salary
                        }
                        updatedJobs.push(updatedJob);
                        resolve(updatedJob);
                    });
                });
            }, Promise.resolve({}));

            val.then(() => {
                return res.json({jobs: updatedJobs});
            });
        });
});

app.post("/post-job", checkCookieTokenAndReturnUserData, async (req, res) => {
    const {jobData} = req.body;
    const employerId = req.userData.userId;
    const newJobId = await getNextSequence('jobId');
    return JobModel.create({
        ...jobData,
        jobTags: jobData.tags,
        jobId: newJobId,
        employerId
    }).then((userDoc) => {
        return res.json(userDoc);
    });
});

app.post("/job-applicants", checkCookieTokenAndReturnUserData, async (req, res) => {
    const {jobId} = req.body;
    let resultApplicants = [];
    return JobApplicantModel.find({jobId})
        .then((jobApplicants) => {
            const val = jobApplicants.reduce((prev, currentValue) => {
                return prev.then(() => {
                    return new Promise(async (resolve) => {
                        let applicant = {};
                        return UserProfileModel.findOne({userId: currentValue.applicantId})
                            .then((profileDetails) => {
                                applicant= {
                                    skills: profileDetails.skills,
                                    githubUsername: profileDetails.githubUsername,
                                    userId: currentValue.applicantId
                                };
                            })
                            .then(() => UserModel.findOne({userId: currentValue.applicantId}))
                            .then((userData) => {
                                applicant = {
                                    ...applicant,
                                    name: userData?.name,
                                    email: userData?.email
                                }
                                resultApplicants.push(applicant);
                                resolve(resultApplicants);
                            });
                    });
                });
            }, Promise.resolve({}));

            val.then(() => {
                return res.json({applicants: resultApplicants});
            });
        });
});

app.get("/jobs", checkCookieTokenAndReturnUserData, async (req, res) => {
    const { tags, salary, pageNum = 1, limit = 20 } = req.query;
    const page = parseInt(pageNum);
    const pageSize = parseInt(limit);
    const intSalary = parseInt(salary || 0);
    let filterQuery = {};
    if (tags && tags !== 'undefined' && tags !== 'null') {
        const tagArray = tags.split(',');
        filterQuery = {
            ...filterQuery,
            jobTags: { $regex: tagArray.join('|'), $options: 'i' }
        };
    }
    if (intSalary){
        filterQuery = {
            ...filterQuery,
            salary: { $gte: intSalary }
        };
    }
    const skip = (page - 1) * pageSize;
    let jobs = await JobModel.find(filterQuery, {_id: 0, __v: 0, employerId: 0})
        .limit(pageSize)
        .skip(skip)
        .lean();
    const totalJobsCount = await JobModel.countDocuments(filterQuery);
    const jobIds = jobs?.map((job) => job.jobId);

    return JobApplicantModel.aggregate([
        {
            $match: {
                jobId: { $in: jobIds }
            }
        },
        {
            $group: {
                _id: "$jobId",
                applicants: {
                    $push: "$applicantId"
                }
            }
        },
        {
            $project: {
                _id: 0,  // Exclude the default _id field
                jobId: "$_id",
                applicants: 1
            }
        }
    ]).exec()
        .then((jobsWithApplicantsArray) => {
            jobs = jobs?.map(job => {
                // Find the matching job in jobsWithApplicants array
                const jobApplicants = jobsWithApplicantsArray?.find(jwa => jwa.jobId === job.jobId);

                // Check if the userId is present in applicantIds
                const hasApplied = jobApplicants ? jobApplicants.applicants.includes(req.userData?.userId) : false;

                // Return the job object with the new attribute hasApplied
                return {
                    ...job,
                    applicationsCount: jobApplicants?.applicants?.length || 0,
                    hasApplied
                };
            });

            const totalPages = Math.ceil(totalJobsCount / pageSize);
            return res.json({
                jobs,
                metadata: {totalJobsCount, totalPages, page, pageSize}
            });
        });
});

app.post('/apply-job', checkCookieTokenAndReturnUserData, async (req, res) => {
    const {jobId} = req.body;
    const applicantId = req.userData.userId;
    return JobApplicantModel.create({
        jobId,
        applicantId,
    })
        .then(async (jobApplicant) => {
            return JobModel.findOne({jobId});
        })
        .then(async (job) => {
            const filterQuery = {jobId: job.jobId};
            const totalApplicantsCount = await JobApplicantModel.countDocuments(filterQuery);
            const updatedJob = {
                jobId: job.jobId,
                jobTitle: job.jobTitle,
                jobDescription: job.jobDescription,
                jobTags: job.jobTags,
                companyName: job.companyName,
                contact: job.contact,
                applicationsCount: totalApplicantsCount,
                salary: job.salary,
                hasApplied: true
            }
            return res.json({job:updatedJob});
        })
});


function checkCookieTokenAndReturnUserData(request, res, next) {
    const {token} = request.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {},(err, decryptedUserModel) => {
            if (err) {
                return res
                    .cookie("token", '', { expires: new Date(0) })
                    .json(err);
            }
            request.userData = decryptedUserModel;
            next();
        });
    } else {
        return res
            .cookie("token", '', { expires: new Date(0) })
            .json('No token found');
    }
}

app.listen(PORT, ()=>{
    console.log(`Running on port ${PORT}`);
});

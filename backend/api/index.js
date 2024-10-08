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
require('dotenv').config();

const app = express();

const jwtSecret = 'test1213Secret65754Key';
const PORT = process.env.PORT || 4000;
const ENVIRONMENT = process.env.NODE_ENV;

app.use(express.json());
app.use(cookieParser());

if (ENVIRONMENT === 'PRODUCTION') {
    // app.use(cors({
    //     credentials: true,
    //     origin: 'https://gojira-ui.vercel.app',
    //     methods: ["POST", "GET", "PUT","DELETE","OPTIONS"]
    // }));
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
    console.log(userId)
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
        .then((jobs) => {
            const resp = jobs?.map(job =>  {
                return {
                    jobId: job.jobId,
                    jobTitle: job.jobTitle,
                    jobDescription: job.jobDescription,
                    jobTags: job.jobTags,
                    companyName: job.companyName,
                    contact: job.contact,
                    applicationsCount: job.applicationsCount,
                    salary: job.salary
                };
            });
            return res.json({jobs: resp});
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
        employerId,
        applicationsCount: 0
    }).then((userDoc) => {
        return res.json(userDoc);
    });
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

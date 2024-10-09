const mongoose = require('mongoose');
const {Schema} = mongoose;

const JobApplicantSchema = new Schema({
    jobId: Number,
    applicantId: Number
});

const JobApplicantModel = mongoose.model('JobApplicant', JobApplicantSchema);

module.exports = JobApplicantModel;

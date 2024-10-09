const mongoose = require('mongoose');
const {Schema} = mongoose;

const JobSchema = new Schema({
    employerId: Number,
    jobId: {type: Number, unique: true},
    jobTitle: String,
    jobDescription: String,
    jobTags: String,
    companyName: String,
    contact: String,
    salary: Number,
});

const JobModel = mongoose.model('Job', JobSchema);

module.exports = JobModel;

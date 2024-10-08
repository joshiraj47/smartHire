const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserProfileSchema = new Schema({
    userId: Number,
    skills: String,
    githubUsername: String,
});

const UserProfileModel = mongoose.model('UserProfile', UserProfileSchema);

module.exports = UserProfileModel;

const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    name: String,
    userId: {type: Number, unique: true},
    username: String,
    email: {type: String, unique: true},
    password: String,
    userRole: String,
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;

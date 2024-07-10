const mongoose = require('mongoose');

const carePulseUserSchema = new mongoose.Schema({
        fullName: {
            type: String,
        },
        email: {
            type: String,
            required: [true, "Please provide a password!"],
            unique: true,
        },
        phone: {
            type: String,
            unique: true,
        },
        dateofbirth: {
            type: String,
        },
        occupation: {
            type: String,
        },
        address: {
            type: String,
        },
        emergencyContact: {
            type: String,
            unique: true,
         },
        emergencyContactPhone: {
            type: String,
            unique: true,
        },
         profilePic: {
             type: String,
             required: false,
         },
         role: {
             type: String,
             default: "Patient",
             required: true,
         },
         otp: {
            type: String,
            required: [true]
        },
        expirationTime: {
            type: String,
            required: [true]
        },
        otpVerified: {
            type: String,
            required: [true]
        },
},
{
    timestamps: true,
}
)

const carePulseUsers = mongoose.model('CarePulseUsers', carePulseUserSchema);
module.exports = carePulseUsers;
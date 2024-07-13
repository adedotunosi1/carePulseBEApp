const mongoose = require('mongoose');

const patientDataSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: {
        type: String, 
    },
    role: {
        type: String,
    },
    bloodGroup: {
        type: String,
    },
    genoType: {
        type: String,
    },
    allergies: {
     type: String,
    },
    medications: {
        type: String,
    },
    medicalHistory: {
        type: String,
    },
},
{
    timestamps: true,
}
)

const carePulsePatients = mongoose.model('PatientMedicalData', patientDataSchema);
module.exports = carePulsePatients;
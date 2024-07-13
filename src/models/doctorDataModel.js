const mongoose = require('mongoose');

const doctorDataSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
        type: String,
    },
    fullName: {
        type: String, 
    },
    medicalLicenseNumber: {
        type: String,
    },
    specialization: {
        type: String,
    },
    yearsOfExperience: {
     type: String,
    },
    consultationHours: {
        type: String,
    },
    clinicName: {
        type: String,
    },
    clinicAddress: {
        type: String,
    },
},
{
    timestamps: true,
}
)

const carePulseDoctors = mongoose.model('DoctorsMedicalData', doctorDataSchema);
module.exports = carePulseDoctors;
const mongoose = require('mongoose');

const identityDocumentSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    documentType: {
        type: String, 
    },
    documentNumber: {
        type: Number
    },
    documentFile: {
        type: String,
    },
    role: {
     type: String,
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
},
{
    timestamps: true,
}
)

const carePulseDocuments = mongoose.model('CarePulseDocuments', identityDocumentSchema);
module.exports = carePulseDocuments;
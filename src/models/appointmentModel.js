const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        default: function() {
            return this._id.toString();
        }
    },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, },
    reason: { type: String, },
    comment: {   type: String, },
    schedule: { type: String, },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'scheduled'], default: 'pending' },
    cancelReason: { type: String, },
},
{
    timestamps: true,
}
)

const carePulseAppointments = mongoose.model('CarePulseAppointments', appointmentSchema);
module.exports = carePulseAppointments;
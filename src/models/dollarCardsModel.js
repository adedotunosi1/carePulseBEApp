const mongoose = require('mongoose');

const DollarCardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    cardId: {
        type: String,
        required: true,
    },
    cardHolder: {
        type: String,
        required: [true, "Card Holder Name"]
    },
    cardNumber: {
        type: Number,
        required: true,
    },
    cardProvider: {
        type: String,
        required: [true, "Card Provider is required"],
        description: 'Visa, MasterCard, American Express e.t.c'
    },
    cardCVV: {
        type: Number,
        required: true,
    },
    cardExpiryDate: {
        type: String,
        required: [true, "Expiry Date is required"]
    }
},
{
    timestamps: true,
})

const userDollarCards = mongoose.model('UsersVirtualCards', DollarCardSchema);
module.exports = userDollarCards;
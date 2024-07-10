const mongoose = require('mongoose');

const usersBankSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    bankName: {
            type: String,
            required: [true, "bank name is required"],
            trim: true,
    },
    bankAccountName: {
            type: String,
            required: [true, "user bank account name is required"],
            trim: true,
          },
    bankAccountNumber: {
            type: Number,
            required: true,
          },
},
{
    timestamps: true,
 }
 );

const bankAccounts = mongoose.model('UsersBankAccounts', usersBankSchema);
module.exports = bankAccounts;
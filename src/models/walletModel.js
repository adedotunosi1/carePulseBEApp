const mongoose = require('mongoose');
const { ACTIONS } = require("../utils/actions");

const walletSchema = new mongoose.Schema({
    balance: {
        naira: {
            type: Number,
            default: 0,
        },
        usd: {
        type: Number,
        default: 0
        }
    },
    walletType: {
        type: String,
        required: [true, "Wallet type is required"],
        enum: ACTIONS.WALLET_TYPE,
        index: true,
    },
    accountName: {
        type: String,
        index: true,
    },
    accountNumber: {
        type: Number,
        default: 0,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users",
    }
},
{timestamps: true }
);

const usersWallet = mongoose.model('UsersWallet', walletSchema);
module.exports = usersWallet;
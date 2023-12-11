const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referralId: [
        {
            type: String,
            unique: true
        }
    ],
    referralLink: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

})

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
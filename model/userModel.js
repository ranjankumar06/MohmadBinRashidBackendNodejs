const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {

        email: {
            type: String
        },
        mobileNumber:{
            type: String
        },
        password:{
            type: String
        },
        userName: {
            type: String
        },
        isVerify: {
            type: Boolean,
            default: true,
        },
        isHost: {
            type: Boolean,
            default: false
        },
        is_deleted:{
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);

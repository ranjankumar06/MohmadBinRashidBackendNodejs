const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
    {

        email: {
            type: String
        },
        name: {
            type: String
        },
        password: {
            type: String
        },
        status: {
            type: Boolean,
            default: true,
        },
        code: {
            type: String
        },
        mobileNumber: {
            type: String
        },
        createdBy: {
            type: String
        },
        is_deleted: {
            type: Boolean,
            default: false
        },

    },
    { timestamps: true }
);
module.exports = mongoose.model("host", hostSchema);

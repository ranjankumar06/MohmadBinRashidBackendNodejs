const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {

        email: {
            type: String
        },
        password: {
            type: String
        },
        role: {
            type: String
        },
        name: {
            type: String
        },
        startTime: {
            type: String
        },
        startDate: {
            type: String
        },
        code:{
            type: String
        },
        description: {
            type: String
        },
        endTime: {
            type: String
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("Admin", adminSchema);

const mongoose = require("mongoose");

const customizeSchema = new mongoose.Schema(
    {

        firstTime: {
            type: Boolean,
        },
        userId: {
            type: String
        },
        jsonValue: {
            type: JSON,
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("customize", customizeSchema);

const mongoose = require("mongoose");

const colourSchema = new mongoose.Schema(
    {

        color: {
            type: String
        },
        is_deleted: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("colour", colourSchema);

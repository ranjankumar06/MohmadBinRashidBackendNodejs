const mongoose = require("mongoose");

const villaSchema = new mongoose.Schema(
    {
        villaImages: [{
            villaId: {
                type: String
            },
            villaImage:
            {
                type: String
            },
            is_deleted: {
                type: Boolean,
                default: false,
            }
        }]
    },
    { timestamps: true }
);
module.exports = mongoose.model("villaImage", villaSchema);

const mongoose = require('mongoose');
const Speech = new mongoose.Schema(
    {
        text: {
            type: String
        },
        language: {
            type: String
        },
        audioPath: {
            type: String
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("Speech", Speech);
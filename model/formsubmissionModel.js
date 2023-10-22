const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const formSchema = new mongoose.Schema(
    {

        userName: {
            type: Number
        },
        date: {
            type: Number
        },
        email: {
            type: Number
        },
        villaId: {
            type: Number
        },
        villaexteriorwallcolour: {
            type: Number
        },
        livingroomwall: {
            type: Number
        },
        livingroomfloor: {
            type: Number
        },
        bedroomwall: {
            type: Number
        },
        bedroomfloor: {
            type: Number
        },
        kitchenwall: {
            type: Number
        },
        kitchenbacksplash: {
            type: Number
        },
        kitchenfloor: {
            type: Number
        },
        washroomwall: {
            type: Number
        },
        washroomfloor: {
            type: Number
        },
        showerfloor: {
            type: Number
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("formsubmissionModel", formSchema);

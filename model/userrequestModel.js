const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userRequestSchema = new mongoose.Schema(
    {
        email: {
            type: String
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        mobileNumber: {
            type: String
        },
        userName: {
            type: String
        },
        appointmentDate: {
            type: String
        },
        startTime: {
            type: String
        },
        hostId: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        endTime: {
            type: String
        },
        villaTiming: [{
            villaId: {
                type: Number
            },
            villaTime: {
                type: String
            }
        }],
        feedback: [{
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
        }],
        duration: {
            type: String
        },
        isSchedule: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: false
        },
        isFinished: {
            type: Boolean,
            default: false
        },
        isSelfJourney: {
            type: Boolean,
            default: false
        },
        notAttended: {
            type: Boolean,
            default: false
        },
        absent: {
            type: String,
            enum: ["User", "Host"]
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        journey_code: {
            type: String
        },
        requestedShift: {
            type: String,
            enum: ["Morning", "Afternoon", "Evening"],
            default: "Morning"
        },

    },
    { timestamps: true }
);
module.exports = mongoose.model("userRequest", userRequestSchema);

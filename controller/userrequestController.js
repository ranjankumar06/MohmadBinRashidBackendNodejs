const userRequest = require("../model/userrequestModel")
const userModel = require("../model/userModel")
const nodeMailer = require("nodemailer");
const hostModel = require("../model/hostModel");
const adminModel = require("../model/adminModel")
const jwt = require("jsonwebtoken")
const config = require("../config/config");
const commonFunction = require('../middleware/commonFunction');
const { validationResult } = require('express-validator');
const moment = require("moment")

const temporaryEmailValidator = require('deep-email-validator');

const { v4: uuidv4 } = require('uuid');
const path = require("path")
const fs = require('fs');
const handlebars = require('handlebars');
const hbs = require('nodemailer-express-handlebars');
const express = require("express");
const nodemailer = require("nodemailer");
const viewPath = path.resolve(__dirname, '../views');
const partialsPath = path.resolve(__dirname, "../views/partials");
const handlebarOptions = {
    viewEngine: {
        extName: ".handlebars",
        // partialsDir: viewPath,
        layoutsDir: viewPath,
        defaultLayout: false,
        partialsDir: partialsPath,
        express,
    },
    viewPath: viewPath,
    extName: ".handlebars",
};
let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,//587,
    secure: true, // true for 465, false for other ports
    auth: {
        user: config.emailUser,
        pass: config.emailPass,
    },
});


exports.sendRequest = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, mobileNumber, userName, requestedShift, appointmentDate } = reqBody

        if (!email || !mobileNumber || !userName || !appointmentDate)
            return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required !" });

        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.send({ responseCode: 200, success: false, responseMessage: "Invalid email" })

        const adminData = await adminModel.findOne({})
        const userdata = await userRequest.findOne({
            $and: [{ email: email },
            { isSelfJourney: false }, { isFinished: false }]
        })
        console.log("Requested ", userdata)
        const findUser = await userModel.findOne({ $and: [{ email: email }, { isHost: false }] })

        if (userdata) {
            return res.send({ responseCode: 200, success: false, responseMessage: "Already sent request !" });
        }
        if (!findUser) {
            function generateRandomCode() {
                const min = 100000; // Minimum 6-digit number
                const max = 999999; // Maximum 6-digit number
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const code = generateRandomCode();

            const user = await userModel.create({
                userName: userName,
                email: email,
                mobileNumber: mobileNumber,
                appointmentDate: appointmentDate

            });
            const userData = await userRequest.create({
                user_id: user._id,
                email,
                mobileNumber,
                userName,
                requestedShift,
                appointmentDate,
                journey_code: code
            })


            transporter.use('compile', hbs(handlebarOptions))

            let info = await transporter.sendMail({
                from: 'MBR@contact.com',
                to: adminData.email,
                subject: "Schedule session email",
                template: 'adminNoticeForScadule',
                context: {
                    userName: userName,
                    mobileNumber: mobileNumber,
                    email: email,
                    journeyId: code,
                    shift: requestedShift,

                    adminName: "MBR Admin"
                },
                attachments: [{
                    //filename: 'appLogo.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/Admin.png`,
                    cid: 'Adminpng'
                },
                {
                    // filename: 'loading.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/Admin-3.png`,
                    cid: 'admin3'
                },
                {
                    //filename: 'discord.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/logo.png`,
                    cid: 'logo'
                }, {
                    //filename: 'fb.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/facebook.png`,
                    cid: 'FB'
                }, {
                    // filename: 'insta.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/instagram.png`,
                    cid: 'Insta'
                },
                {
                    //filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/twitter.png`,
                    cid: 'Twitter'
                },
                {
                    // filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/snapchat.png`,
                    cid: 'snapchat'
                },
                {
                    // filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/web.png`,
                    cid: 'web'
                },
                {
                    // filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/footerPanel.png`,
                    cid: 'footerPanel'
                },
                ]
            });


            res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!", responseResult: userData });

        }
        else {
            function generateRandomCode() {
                const min = 100000; // Minimum 6-digit number
                const max = 999999; // Maximum 6-digit number
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const code = generateRandomCode();

            const userData = await userRequest.create({
                email,
                mobileNumber,
                userName,
                requestedShift,
                appointmentDate,
                journey_code: code

            })


            transporter.use('compile', hbs(handlebarOptions))

            let info = await transporter.sendMail({
                from: 'MBR@contact.com',
                to: adminData.email,
                subject: "Schedule session email",
                template: 'adminNoticeForScadule',
                context: {
                    userName: userName,
                    mobileNumber: mobileNumber,
                    email: email,
                    journeyId: code,
                    shift: requestedShift,

                    adminName: "MBR Admin"
                },
                attachments: [{
                    //filename: 'appLogo.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/Admin.png`,
                    cid: 'Adminpng'
                },
                {
                    // filename: 'loading.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/Admin-3.png`,
                    cid: 'admin3'
                },
                {
                    //filename: 'discord.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/logo.png`,
                    cid: 'logo'
                }, {
                    //filename: 'fb.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/facebook.png`,
                    cid: 'FB'
                }, {
                    // filename: 'insta.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/instagram.png`,
                    cid: 'Insta'
                },
                {
                    //filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/twitter.png`,
                    cid: 'Twitter'
                },
                {
                    // filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/snapchat.png`,
                    cid: 'snapchat'
                },
                {
                    // filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/web.png`,
                    cid: 'web'
                },
                {
                    // filename: 'twitter.jpg',
                    path: `https://metaverse.mbrhe.ae/api/file/path/footerPanel.png`,
                    cid: 'footerPanel'
                },
                ]
            });



            res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!", responseResult: userData });
        }
    }
    catch (error) {
        return res.send({ responseCode: 400, success: false, responseMessage: error.message })
    }
}

// Create self journey details
exports.createSelfJourney = async (req, res) => {
    try {
        const reqBody = req.body;
        const user = req.user;
        const authUser = user._id;
        const User = await userModel.findOne({ _id: authUser })
        if (!User)
            return res.send({ responseCode: 200, success: false, responseMessage: "You are not a User!" })
        function generateRandomCode() {
            const min = 100000; // Minimum 6-digit number
            const max = 999999; // Maximum 6-digit number
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        const code = generateRandomCode()

        const userData = await userRequest.create({
            user_id: authUser,
            email: User.email,
            mobileNumber: User.mobileNumber,
            userName: User.userName,
            appointmentDate: moment(new Date()).format("DD/MM/YYYY"),
            isSelfJourney: true,
            journey_code: code,
            startTime: moment().utc().format("HH:mm"),
        })
        const accessToken = jwt.sign(
            {
                success: true,
                message: "User detail !",
                user: {
                    _id: user._id,
                    journey_code: code,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );


        return res.send({ responseCode: 200, success: true, responseMessage: "Journey saved successfully!", responseResult: userData, token: accessToken });

    }
    catch (error) {
        return res.send({ responseCode: 400, success: false, responseMessage: error.message })

    }
}



exports.update_isActive = async (req, res) => {
    try {
        const reqBody = req.body
        const { journeyId } = reqBody
        if (!journeyId)
            return res.send({ responseCode: 200, success: false, responseMessage: "JourneyId is required" })
        const result = await userRequest.findOneAndUpdate(
            { journey_code: journeyId },
            {
                $set: {
                    isActive: true
                },
            },
            { new: true }
        );

        return res.send({ responseCode: 200, success: true, responseMessage: "User is active successfully", responseResult: result })

    }
    catch (error) {
        return res.send({ responseCode: 400, success: false, responseMessage: error.message })
    }
}


exports.saveJourneyTime = async (req, res) => {
    try {
        const reqBody = req.body
        const user = req.user;
        const authUser = user._id;
        console.log("reqBody", reqBody)
        const { journeyCode, villaTime, villaId } = reqBody
        if (!journeyCode) {
            return res.send({ responseCode: 200, success: false, responseMessage: "All fileds are required!" })
        }
        const User = await userModel.findOne({ _id: authUser })
        if (!User)
            return res.send({ responseCode: 200, success: false, responseMessage: "You are not a User!" })

        const findJourney = await userRequest.findOne({ $and: [{ journey_code: journeyCode }, { isActive: true }, { isFinished: false }, { notAttended: false }] });
        if (findJourney) {
            var toPush = {
                villaId: villaId,
                villaTime: villaTime
            }
            const journey = await userRequest.findOneAndUpdate(
                { journey_code: journeyCode },
                {
                    $push: {
                        villaTiming: toPush,
                    },
                },
                { new: true }
            )
            return res.send({ responseCode: 200, success: true, responseMessage: "Host Journey start successfully", responseResult: journey })
        }
        else {
            return res.send({ responseCode: 200, success: true, responseMessage: "Journey does not exits" })
        }

    }
    catch (error) {
        return res.send({ responseCode: 400, success: false, responseMessage: error.message })
    }
}


// Update not atttended journey
exports.update_notAttended = async (req, res) => {
    try {
        const user = req.user;
        const authUser = user._id;
        const reqBody = req.body
        const { journeyCode, isHost } = reqBody
        const User = await userModel.findOne({ $and: [{ _id: authUser }, { isHost: isHost }] });
        if (!User)
            return res.send({ responseCode: 200, success: false, responseMessage: "You are not register user!" })

        if (!journeyCode)
            return res.send({ responseCode: 200, success: false, responseMessage: "All feilds  is required" })

        if (isHost == false) {
            const result = await userRequest.findOneAndUpdate(
                { journey_code: journeyCode },
                {
                    $set: {
                        notAttended: true,
                        absent: "Host"

                    },
                },
                { new: true }
            );
            return res.send({ responseCode: 200, success: true, responseMessage: "Host didn't  attended", responseResult: result })
        }
        else if (isHost == true) {
            const result = await userRequest.findOneAndUpdate(
                { journey_code: journeyCode },
                {
                    $set: {
                        notAttended: true,
                        absent: "User"
                    },
                },
                { new: true }
            );
            return res.send({ responseCode: 200, success: true, responseMessage: "User didn't  attended ", responseResult: result })
        }

    }
    catch (error) {
        return res.send({ responseCode: 400, success: false, responseMessage: error.message })
    }
}




// Update finished journey
exports.updateFinished = async (req, res) => {
    try {
        const user = req.user;
        const authUser = user._id;
        const reqBody = req.body
        const { journeyCode, isHost } = reqBody
        const User = await userModel.findOne({ $and: [{ _id: authUser }, { isHost: isHost }] });
        if (!User)
            return res.send({ responseCode: 200, success: false, responseMessage: "You are not register user!" })

        if (!journeyCode)
            return res.send({ responseCode: 200, success: false, responseMessage: "All feilds  is required" })

        if (isHost == false) {
            const result = await userRequest.findOneAndUpdate(
                { journey_code: journeyCode },
                {
                    $set: {
                        isFinished: true,

                    },
                },
                { new: true }
            );
            return res.send({ responseCode: 200, success: true, responseMessage: "User finished the journey ", responseResult: result })
        }
        else if (isHost == true) {
            const result = await userRequest.findOneAndUpdate(
                { journey_code: journeyCode },
                {
                    $set: {
                        isFinished: true,
                    },
                },
                { new: true }
            );
            return res.send({ responseCode: 200, success: true, responseMessage: "Host finished the journey", responseResult: result })
        }

    }
    catch (error) {
        return res.send({ responseCode: 400, success: false, responseMessage: error.message })
    }
}


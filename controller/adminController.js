const adminModel = require("../model/adminModel")
const nodeMailer = require("nodemailer");
const userModel = require("../model/userModel")
const userRequest = require("../model/userrequestModel")
const hostModel = require("../model/hostModel")
const jwt = require("jsonwebtoken")
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config()
const publicDir = require('path').join(__dirname, '../uploads');
const villaModel = require("../model/villaModel")
const colourModel = require("../model/colourModel");
const hbs = require('nodemailer-express-handlebars');
const { v4: uuidv4 } = require('uuid');
const path = require("path")
const config = require("../config/config");
const userFormModel = require("../model/formsubmissionModel")
var disposableDomains = require('disposable-email-domains');
const validator = require('email-validator'); // Install using "npm install email-validator"
const temporaryEmailValidator = require('temporary-email-address-validator');
const commonFunction = require('../middleware/commonFunction');
const { validationResult, body } = require('express-validator');
const nodemailer = require("nodemailer");
const moment = require('moment')
const express = require("express");
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

exports.adminLogin = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email, password } = reqBody
    if (!email || !password)
      return res.send({ responseCode: 200, success: false, responseResult: "All feilds are required !" });

    if ((email == 'primusbase1210@gmail.com') && password == 'admin123') {
      let userData = await adminModel.findOne({ email: email });
      if (!userData) {
        const admin = await adminModel.create({
          password: bcrypt.hashSync(password),
          email: email
        })
        const accessToken = jwt.sign(
          {
            success: true,
            message: "User detail !",
            user: {
              email: admin.email,
              password: admin.password,
              _id: admin._id,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        return res.send({ reponseCode: 200, success: true, responseMessage: 'Admin created  Successfully', responseResult: admin, token: accessToken },);
      }
      else {

        let passCheck = bcrypt.compareSync(password, userData.password);

        // console.log("adjfhjkasdhjkh", passCheck)

        if (passCheck == false) {
          return res.send({ reponseCode: 200, success: false, responseMessage: 'Incorrect password.' })
        }
        else {
          const accessToken = jwt.sign(
            {
              success: true,
              message: "User detail !",
              user: {
                email: userData.email,
                password: userData.password,
                _id: userData._id,
              },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );

          return res.send({ responseCode: 200, success: true, responseMessage: "Admin login successfully", responseResult: userData, token: accessToken })
        }
      }
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Email or password is wrong !" })
    }
  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }

}

exports.assignSchedule = async (req, res) => {
  try {
    const reqBody = req.body;
    const { startTime, hostId, scheduleId, } = reqBody

    if (!hostId || !startTime || !scheduleId)
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required !" });
    console.log("srtart time ", startTime)
    const calTiume = moment(startTime, "HH:mm").add(1, 'hours')
    const endTime = moment(calTiume).format("HH:mm")
    console.log("Final End TIme ", endTime)
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })

    if (!admin)
      res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    // console.log(code);
    let userdata = await userModel.findOne({ $and: [{ _id: hostId }, { isHost: true }, { is_deleted: false }] })

    if (!userdata)
      return res.send({ responseCode: 200, success: false, responseMessage: "Host not found" })

    let userResult = await userRequest.findOne({ $and: [{ journey_code: scheduleId }, { isActive: false }, { isSchedule: false }] });
    if (!userResult) {
      return res.send({ responseCode: 200, success: false, responseMessage: "ScheduleId not found" })
    }
    else {
      const result = await userRequest.findOneAndUpdate(
        { journey_code: scheduleId },
        {
          $set: {
            startTime: startTime,
            hostId: hostId,
            endTime: endTime,
            isSchedule: true,
          },
        },
        { new: true }
      );

      let emailBody = {
        startTime: startTime,
        hostId: hostId,
        endTime: endTime,
        journeyId: scheduleId,
        userName: userResult.userName,
        shift: result.requestedShift,
      }
      console.log('data to send ', emailBody)


      transporter.use('compile', hbs(handlebarOptions))

      let info = await transporter.sendMail({
        from: 'MBR@contact.com',
        to: userResult.email,
        subject: "Schedule session email",
        template: 'scheduleUpcomingJourneytoUser',
        context: {
          topName: result.userName,
          startTime: startTime,
          userName: userdata.userName,
          hostId: hostId,
          shift: result.requestedShift,
          journeyId: scheduleId,
          endTime: endTime,
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

      console.log('Sending mail to ', userResult.email, 'and', admin.email)
      transporter.use('compile', hbs(handlebarOptions))

      let adminEmail = await transporter.sendMail({
        from: 'MBR@contact.com',
        to: admin.email,
        subject: "Schedule session email",
        template: 'scheduleUpcomingJourneytoHost',
        context: {
          topName: "MBR Admin",
          startTime: startTime,
          userName: userdata.userName,
          hostId: hostId,
          shift: result.requestedShift,
          JourneyId: scheduleId,
          endTime: endTime,
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
        },]
      });

      // const mailOptions = {
      //   from: config.emailUser,
      //   to: userResult.email,
      //   subject: 'Schedule session email',
      //   template: 'home',
      // }

      // const mailHost = {
      //   from: config.emailUser,
      //   to: admin.email,
      //   subject: 'Schedule session email',
      //   template: 'home',
      // }

      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.error("Error sending email:", error);
      //   } else {
      //     res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!", responseResult: result });
      //     console.log("Email sent successfully:", info.response);
      //   }
      // })
      // transporter.sendMail(mailHost, (error, info) => {
      //   if (error) {
      //     console.error("Error sending email:", error);
      //   } else {
      //     res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!" });
      //     console.log("Email sent successfully:", info.response);
      //   }
      // })

      // let send = await commonFunction.sendToHostEmail(emailBodyHost, emailTo)
      // let sendsecond = await commonFunction.sendToUserEmail(userEmail, email)

      console.log(adminEmail);

      res.send({ responseCode: 200, success: true, responseMessage: "Admin sent mail successfully !", responseResult: result });
    }
  }


  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}


// exports.createHost = async (req, res) => {
//   try {
//     const user = req.user;
//     const id = user._id;
//     let adminData = await adminModel.findOne({ _id: id })
//     if (!adminData)
//       return res.send({ responseCode: 200, success: false, responseMessage: 'Host creator is not the Admin !' });

//     const reqBody = req.body
//     const { userName, role, mobileNumber, email } = reqBody
//     if (!name || !role || !mobileNumber || !email)
//       return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required !" });

//     let result = await userModel.findOne({ email: email })
//     if (result)
//       return res.send({ reponseCode: 200, success: false, responseMessage: 'Email already exists' })


//     const length = req.body.length || 12;
//     const password = generateRandomPassword(length);
//     function generateRandomPassword(length) {
//       const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
//       const passwordArray = [];
//       const characterCount = characters.length;

//       for (let i = 0; i < length; i++) {
//         const randomIndex = crypto.randomInt(0, characterCount);
//         const randomCharacter = characters.charAt(randomIndex);
//         passwordArray.push(randomCharacter);
//       }
//       return passwordArray.join('');
//     }
//     const host = await hostModel.create({
//       name,
//       password: bcrypt.hashSync(password),
//       role,
//       mobileNumber,
//       email
//     })

//     // const result = await userRequest.findOneAndUpdate(
//     //   { _id: journeyId },
//     //   {
//     //     $set: {
//     //       isSchedule: true
//     //     },
//     //   },
//     //   { new: true }
//     // );

//     // if (host) {
//     const emailBody = templatehost({
//       email: email,
//       mobileNumber: mobileNumber,
//       userName: name,
//       password: password,
//       role: role
//     });

//     let html = emailBody
//     let adminEmail = adminData.email

//     // const transporter = nodeMailer.createTransport({
//     //   service: 'gmail',
//     //   host: 'smtp.gmail.com',
//     //   port: 465,
//     //   secure: false,
//     //   requireTLS: true,
//     //   auth: {
//     //     user: config.emailUser,
//     //     pass: config.emailPass,
//     //   },
//     // });

//     // const mailAdmin = {
//     //   from: config.emailUser,
//     //   to: "ranjan.abhiwan01@gmail.com",
//     //   subject: 'Login Credentials',
//     //   html: emailBody
//     // }
//     // transporter.sendMail(mailAdmin, (error, info) => {
//     //   if (error) {
//     //     console.error("Error sending email:", error);
//     //   } else {
//     //     // res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!", responseResult: result });
//     //     console.log("Email sent successfully:", info.response);
//     //   }
//     // })
//     // const mailOptions = {
//     //   from: config.emailUser,
//     //   to: email,
//     //   subject: ' Your Login Credentials',
//     //   html: emailBody

//     // }
//     // transporter.sendMail(mailOptions, (error, info) => {
//     //   if (error) {
//     //     console.error("Error sending email:", error);
//     //   } else {
//     //     // res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!", responseResult: result });
//     //     console.log("Email sent successfully:", info.response);
//     //   }
//     // })

//     let send = await commonFunction.sendTohost(email, html)
//     let sendAdmin = await commonFunction.sendToAdmin(adminEmail, html)

//     return res.send({ responseCode: 200, success: true, responseMessage: "Host created successfully !", responseResult: host });
//     // }
//   }

//   catch (error) {
//     return res.send({ responseCode: 400, responseMessage: error.message })
//   }
// }

exports.createHost = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body
    const { userName, password, mobileNumber, email } = reqBody

    let adminData = await adminModel.findOne({ _id: id })
    if (!adminData)
      return res.send({ responseCode: 200, success: false, responseMessage: 'Host creator is not the Admin !' });

    if (!userName || !password || !mobileNumber || !email)
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required !" });

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.send({ responseCode: 200, success: false, responseMessage: "Invalid email" })

    const result = await userModel.findOne({ $and: [{ email: email }, { isHost: true }] })
    if (result) {
      return res.send({ reponseCode: 200, success: false, responseMessage: 'Email already exists' })

    }
    else {
      const hostData = await userModel.create({
        userName: userName,
        password: bcrypt.hashSync(password),
        mobileNumber: mobileNumber,
        email: email,
        isHost: true
      })
      // const emailBody = templatehost({
      //   email: email,
      //   mobileNumber: mobileNumber,
      //   userName: userName,
      //   password: password
      // });

      transporter.use('compile', hbs(handlebarOptions))

      let info = await transporter.sendMail({
        from: 'MBR@contact.com',
        to: email,
        subject: "Your login credentailas.",
        template: 'loginCredentialsforHost',
        context: {
          email: email,
          mobileNumber: mobileNumber,
          userName: userName,
          password: password
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


      // let html = emailBody

      // let send = await commonFunction.sendTohost(email, html)

      return res.send({ responseCode: 200, success: true, responseMessage: "Host created successfully", responseResult: hostData })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })

  }
}


exports.updateHost = async (req, res) => {
  try {
    const reqBody = req.body
    const { userName, mobileNumber, email, password } = reqBody
    const user = req.user;
    const id = user._id;
    let adminData = await adminModel.findOne({ _id: id })
    if (!adminData)
      return res.send({ responseCode: 200, success: false, responseMessage: 'Admin is not found !' });

    if (!userName || !mobileNumber || !email || !password)
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required !" });

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.send({ responseCode: 200, success: false, responseMessage: "Invalid email" })

    const data = await userModel.findOne({ $and: [{ email: email }, { isHost: true }, { is_deleted: false }] });
    if (!data)
      return res.send({ responseCode: 200, success: false, responseMessage: 'Host not found.' });


    // const length = req.body.length || 12;
    // const password = generateRandomPassword(length);
    // function generateRandomPassword(length) {
    //   const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    //   const passwordArray = [];
    //   const characterCount = characters.length;

    //   for (let i = 0; i < length; i++) {
    //     const randomIndex = crypto.randomInt(0, characterCount);
    //     const randomCharacter = characters.charAt(randomIndex);
    //     passwordArray.push(randomCharacter);
    //   }
    //   return passwordArray.join('');
    // }
    const result = await userModel.findOneAndUpdate(
      { _id: data._id },
      {
        $set: {
          password: bcrypt.hashSync(password),
          userName: userName,
          email: email,
          isHost: true,
          mobileNumber: mobileNumber
        },
      },
      { new: true }
    );

    const emailBody = templatehost({
      email: email,
      mobileNumber: mobileNumber,
      userName: userName,
      password: password
    });

    let html = emailBody
    let send = await commonFunction.sendTohost(email, html)

    return res.send({ responseCode: 200, success: true, responseMessage: "Host updated successfully", responseResult: result })
  }

  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.scheduleList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    else {
      const scheduleData = await userRequest.find({ $and: [{ isSchedule: false }, { isActive: false }, { isFinished: false }, { is_deleted: false }] });
      if (scheduleData) {
        return res.send({ responseCode: 200, success: true, responseMessage: "Schedule list get successfully", responseResult: scheduleData })
      }
      else {
        return res.send({ responseCode: 200, success: false, responseMessage: "Schedule list not found", responseResult: scheduleData })
      }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.deleteHost = async (req, res) => {
  try {
    const reqBody = req.body
    const { hostId } = reqBody
    const user = req.user;
    const id = user._id;
    const findAdmin = await adminModel.findOne(
      { _id: id }
    );
    if (!findAdmin)
      return res.send({ responseCode: 200, success: false, responseMessage: 'Admin not found.' });
    const findHost = await userModel.findOne({ $and: [{ _id: hostId }, { is_deleted: false }, { isHost: true }] })
    if (!findHost)
      return res.send({ responseCode: 200, success: false, responseMessage: "Host does not exist" })

    const deleted = await userModel.findOneAndUpdate(
      { $and: [{ _id: findHost._id }, { is_deleted: false }] },
      {
        $set: {
          is_deleted: true,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      responseMessage: "Host deleted successfully !",
      responseResult: deleted,
    });
  }

  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.hostList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const hostData = await userModel.find({ $and: [{ is_deleted: false }, { isHost: true }] })

    return res.send({ responseCode: 200, success: true, responseMessage: "Host list get successfully", responseResult: hostData })
  }

  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.userUpcommingList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    else {
      const userDataUpcomming = await userRequest.find({ $and: [{ isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] }).populate('hostId');
      const userDataActive = await userRequest.find({ $and: [{ isActive: true }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] }).populate('hostId');
      const userDataNotAttended = await userRequest.find({ $and: [{ isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: true }] }).populate('hostId');
      const userDataFinished = await userRequest.find({ $and: [{ isFinished: true }, { is_deleted: false }, { notAttended: false }] }).populate('hostId');

      const journey = {
        upcomming: userDataUpcomming,
        active: userDataActive,
        finished: userDataFinished,
        notAttended: userDataNotAttended
      }

      return res.send({ responseCode: 200, success: true, responseMessage: "User upcomming list get successfully", responseResult: journey })


    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.usermonthWiseList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body;
    const { email } = reqBody
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    const findUser = await userModel.findOne({ $and: [{ email: email }, { isHost: false }] });
    if (findUser) {
      const finishedHost = await userRequest.find({ $and: [{ email: email }, { isFinished: true }, { is_deleted: false }] })
      const activeHost = await userRequest.find({ $and: [{ email: email }, { isActive: true }, { is_deleted: false }, { isFinished: false }] })
      const notattendHost = await userRequest.find({ $and: [{ email: email }, { notAttended: true }, { is_deleted: false }] })
      const upcommingHost = await userRequest.find({ $and: [{ email: email }, { isSchedule: true }, { is_deleted: false }, { isActive: false }, { isFinished: false }] })
      const count = {
        finishd: finishedHost.length,
        active: activeHost.length,
        notAttended: notattendHost.length,
        upcomming: upcommingHost.length
      }

      const userdata = await userRequest.find({ email: email }).populate([
        {
          path: 'hostId',
          model: 'user',
          select: '_id userName email'
        }]);
      // console.log("|kjdhsfkjshdf", userdata)
      let filterData = [];
      for (let i = 0; i < userdata.length; i++) {
        let date = userdata[i].appointmentDate;

        var check = moment(date, 'YYYY/MM/DD');
  
        var month = check.format('MM');
        var day = check.format('D');
        var year = check.format('YYYY');
        var qMonth = query.month;
        var qYear = query.year
        console.log("hhskdjfhkj\n", qMonth, '\n', month, "\n\n", qYear, year)
        if (month == qMonth && year == qYear) {
          filterData.push(userdata[i]);
        }

      }

      return res.send({ responseCode: 200, success: true, responseMessage: `User data get month wise successfully`, responseResult: filterData, count: count })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Something went wrong" });
    }

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

// get all journey month wise
exports.monthWiseList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body;
    const query = req.query;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const finishedHost = await userRequest.find({ $and: [{ isFinished: true }, { is_deleted: false }] })
    const activeHost = await userRequest.find({ $and: [{ isActive: true }, { is_deleted: false }, { isFinished: false }] })
    const notattendHost = await userRequest.find({ $and: [{ notAttended: true }, { is_deleted: false }] })
    const upcommingHost = await userRequest.find({ $and: [{ isSchedule: true }, { is_deleted: false }, { isActive: false }, { isFinished: false }] })
    const count = {
      finishd: finishedHost.length,
      active: activeHost.length,
      notAttended: notattendHost.length,
      upcomming: upcommingHost.length
    }
    const userdata = await userRequest.find({}).populate([
      {
        path: 'hostId',
        model: 'user',
        select: '_id userName email'
      }]);
    // console.log("|kjdhsfkjshdf", userdata)
    let filterData = [];
    for (let i = 0; i < userdata.length; i++) {
      let date = userdata[i].appointmentDate;

      var check = moment(date, 'YYYY/MM/DD');

      var month = check.format('MM');
      var day = check.format('D');
      var year = check.format('YYYY');
      var qMonth = query.month;
      var qYear = query.year
      console.log("hhskdjfhkj\n", qMonth, '\n', month, "\n\n", qYear, year)
      if (month == qMonth && year == qYear) {
        filterData.push(userdata[i]);
      }

    }

    return res.send({ responseCode: 200, success: true, responseMessage: `Get month wise successfully journey`, responseResult: filterData, count: count })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}
function getDataByMonthAndYear(data, req, month, year) {
  let DATE = new Date(data.createdAt);
  if (month && !year) {
    return DATE.getMonth() == req.query.month;
  } else if (!month && year) {
    return DATE.getFullYear() == req.query.year
  } else {
    return DATE.getMonth() == req.query.month && DATE.getFullYear() == req.query.year;
  }
}

function getDataByMonthAndYear(data, req, month, year) {
  let DATE = new Date(data.createdAt);
  if (month && !year) {
    return DATE.getMonth() == req.query.month;
  } else if (!month && year) {
    return DATE.getFullYear() == req.query.year
  } else {
    return DATE.getMonth() == req.query.month && DATE.getFullYear() == req.query.year;
  }
}

exports.unattendUserlist = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })


    const userData = await userRequest.find({ $and: [{ is_deleted: false }, { notAttended: true }] }).populate([
      {
        path: 'hostId',
        model: 'host',
        select: '_id name email'
      }]);

    return res.send({ responseCode: 200, success: true, responseMessage: "Unattened user get successfully", responseResult: userData })
  }

  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.activeUser = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    else {
      const User = await userRequest.find({ $and: [{ isActive: true }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] }).populate([
        {
          path: 'hostId',
          model: 'host',
          select: '_id name email'
        }]);
      if (User.length > 0) {
        return res.send({ responseCode: 200, success: true, responseMessage: "Active User get successfully", responseResult: User })
      }
      else {
        return res.send({ responseCode: 200, success: false, responseMessage: "Active User not found", responseResult: User })
      }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.upcommingUserJourney = async (req, res) => {
  try {
    const reqBody = req.body
    const { email } = reqBody
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    if (!email)
      return res.send({ responseCode: 200, success: false, responseMessage: "Email is required" })

    const userData = await userRequest.findOne({ $and: [{ email: email }, { isSchedule: true }, { is_deleted: false, }, { isActive: false }] }).populate([
      {
        path: 'hostId',
        model: 'user',
        select: '_id name email'
      }]);
    return res.send({ responseCode: 200, success: true, responseMessage: "User get successfully", responseResult: userData })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.userList = async (req, res) => {
  try {
    // const reqBody = req.body
    // const { email } = reqBody

    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "Admin not found!" })
    const userData = await userModel.find({ is_deleted: false })

    return res.send({ responseCode: 200, success: true, responseMessage: "User list get successfully", responseResult: userData })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

// exports.monthWiseJourneyUser = async (req, res) => {
//   try {
//     const reqBody = req.body
//     const { email } = reqBody
//     const user = req.user;
//     const id = user._id;
//     const admin = await adminModel.findOne({ _id: id })
//     if (!admin) {
//       return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
//     }
//     if (!email) {
//       return res.send({ responseCode: 200, success: false, responseMessage: "Email is required" })
//     }
//     else {
//       const finishedHost = await userRequest.find({ $and: [{ email: email }, { isFinished: false }, { is_deleted: false }] })
//       const activeHost = await userRequest.find({ $and: [{ email: email }, { isActive: true }, { is_deleted: false }, { isFinished: false }] })
//       const notattendHost = await userRequest.find({ $and: [{ email: email }, { notAttended: false }, { is_deleted: false }] })
//       const upcommingHost = await userRequest.find({ $and: [{ email: email }, { isSchedule: true }, { is_deleted: false }, { isActive: true }, { isFinished: false }] })
//       const count = {
//         finishd: finishedHost.length,
//         active: activeHost.length,
//         notAttended: notattendHost.length,
//         upcomming: upcommingHost.length
//       }

//       const userdata = await userRequest.find({ email: email }).populate([
//         {
//           path: 'hostId',
//           model: 'host',
//           select: '_id name email'
//         }]);
//       let filterData = [];
//       for (let i = 0; i < userdata.length; i++) {
//         let date = userdata[i].appointmentDate;
//         const month = date.split('/')[1];
//         const year = date.split('/')[2];
//         console.log("hhskdjfhkj", month, "\n\n", year)
//         if (month == req.query.month && year == req.query.year) {
//           filterData.push(userdata[i]);
//         }
//         else {
//           filterData = [];
//         }
//       }
//       if (userdata.length > 0) {
//         return res.send({ responseCode: 200, responseMessage: `User data get month wise successfully`, responseResult: filterData, count: count })
//       }
//       else if (!req.query.month) {
//         return res.send({ responseCode: 200, success: false, responseMessage: "Data not found", responseResult: filterData })
//       }
//       else {
//         return res.send({ responseCode: 200, success: false, responseMessage: "Not found", responseResult: filterData })
//       }
//     }
//   }
//   catch (error) {
//     return res.send({ responseCode: 400, responseMessage: error.message })
//   }
// }

// function getDataByMonthAndYear(data, req, month, year) {
//   let DATE = new Date(data.createdAt);
//   if (month && !year) {
//     return DATE.getMonth() == req.query.month;
//   } else if (!month && year) {
//     return DATE.getFullYear() == req.query.year
//   } else {
//     return DATE.getMonth() == req.query.month && DATE.getFullYear() == req.query.year;
//   }
// }

// exports.userUnattenedJourney = async (req, res) => {
//   try {
//     const reqBody = req.body
//     const { email } = reqBody
//     const user = req.user;
//     const id = user._id;
//     const admin = await adminModel.findOne({ _id: id })
//     if (!admin) {
//       return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
//     }
//     if (!email) {
//       return res.send({ responseCode: 200, success: false, responseMessage: "Email is required" })
//     }
//     else {
//       const userData = await userRequest.find({ $and: [{ email: email }, { isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: true }] }).populate([
//         {
//           path: 'hostId',
//           model: 'host',
//           select: '_id name email'
//         }]);
//       if (userData.length > 0) {
//         return res.send({ responseCode: 200, success: true, responseMessage: "Unattened user get successfully", responseResult: userData })
//       }
//       else {
//         return res.send({ responseCode: 200, success: false, responseMessage: "Unattened user not found", responseResult: userData })
//       }
//     }
//   }
//   catch (error) {
//    return res.send({ responseCode: 400, responseMessage: error.message })
//   }
// }



// exports.activeUserJourney = async (req, res) => {
//   try {
//     const reqBody = req.body
//     const { email } = reqBody
//     const user = req.user;
//     const id = user._id;
//     const admin = await adminModel.findOne({ _id: id })
//     if (!admin) {
//       return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
//     }
//     if (!email) {
//       return res.send({ responseCode: 200, success: false, responseMessage: "Email is required" })
//     }
//     else {
//       const User = await userRequest.find({ $and: [{ email: email }, { isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] }).populate([
//         {
//           path: 'hostId',
//           model: 'host',
//           select: '_id name email'
//         }]);
//       if (!User) {
//         return res.send({ responseCode: 200, success: false, responseMessage: "Active User not found", responseResult: User })
//       }
//       else {
//         return res.send({ responseCode: 200, success: true, responseMessage: "Active User get successfully", responseResult: User })
//       }
//     }
//   }
//   catch (error) {
//     return res.send({ responseCode: 400, responseMessage: error.message })
//   }
// }

exports.hostUpcommingJourney = async (req, res) => {
  try {
    const reqBody = req.body
    const { hostId } = reqBody
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    if (!hostId)
      return res.send({ responseCode: 200, success: false, responseMessage: "hostId is required" })


    const findHost = await userModel.findOne({ $and: [{ _id: hostId }, { isHost: true }] });
    if (findHost) {
      const userData = await userRequest.find({ $and: [{ hostId: hostId }, { isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] }).populate([
        {
          path: 'hostId',
          model: 'user',
          select: '_id userName email'
        }]);

      return res.send({ responseCode: 200, success: true, responseMessage: "Host get successfully", responseResult: userData })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Something went wrong!" })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.hostMonthWiseJourney = async (req, res) => {
  try {
    const reqBody = req.body
    const { hostId } = reqBody
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    if (!hostId)
      return res.send({ responseCode: 200, success: false, responseMessage: "hostId is required" })

    const findHost = await userModel.findOne({ $and: [{ _id: hostId }, { isHost: true }] })
    if (findHost) {
      const finishedHost = await userRequest.find({ $and: [{ hostId: hostId }, { isFinished: true }, { is_deleted: false }] })
      const activeHost = await userRequest.find({ $and: [{ hostId: hostId }, { isActive: true }, { is_deleted: false }, { isFinished: false }] })
      const notattendHost = await userRequest.find({ $and: [{ hostId: hostId }, { notAttended: true }, { is_deleted: false }] })
      const upcommingHost = await userRequest.find({ $and: [{ hostId: hostId }, { isSchedule: true }, { is_deleted: false }, { isActive: false }, { isFinished: false }] })
      const count = {
        finishd: finishedHost.length,
        active: activeHost.length,
        notAttended: notattendHost.length,
        upcomming: upcommingHost.length
      }
      const findHost = await userModel.findOne({ _id: hostId });
      const userdata = await userRequest.find({ hostId: hostId });
      let filterData = [];
      for (let i = 0; i < userdata.length; i++) {
        let date = userdata[i].appointmentDate;
        const month = date.split('/')[1];
        const year = date.split('/')[2];
        console.log("hhskdjfhkj", month, "\n\n", year)
        if (month == req.query.month && year == req.query.year) {
          filterData.push(userdata[i]);
        }

      }

      return res.send({ responseCode: 200, success: true, responseMessage: `Host data get month wise successfully`, responseResult: filterData, count: count })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Something went wrong" })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

function getDataByMonthAndYear(data, req, month, year) {
  let DATE = new Date(data.createdAt);
  if (month && !year) {
    return DATE.getMonth() == req.query.month;
  } else if (!month && year) {
    return DATE.getFullYear() == req.query.year
  } else {
    return DATE.getMonth() == req.query.month && DATE.getFullYear() == req.query.year;
  }
}

exports.unattenedHostJourney = async (req, res) => {
  try {
    const reqBody = req.body
    const { hostId } = reqBody
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    if (!hostId)
      return res.send({ responseCode: 200, success: false, responseMessage: "hostId is required" })
    const findHost = await userModel.findOne({ $and: [{ _id: hostId }, { isHost: true }] });
    if (findHost) {
      const User = await userRequest.find({ $and: [{ hostId: hostId }, { isActive: true }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: true }] })
      return res.send({ responseCode: 200, success: true, responseMessage: "Unattended host get successfully", responseResult: User })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Something went wrong" })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.activeHostJourney = async (req, res) => {
  try {
    const reqBody = req.body
    const { hostId } = reqBody
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    if (!hostId)
      return res.send({ responseCode: 200, success: false, responseMessage: "Host is required" })
    const findHost = await userModel.findOne({ $and: [{ _id: hostId }, { isHost: true }] });
    if (findHost) {
      const User = await userRequest.find({ $and: [{ hostId: hostId }, { isActive: true }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] })
      if (!User) {
        return res.send({ responseCode: 200, success: false, responseMessage: "Active host not found", responseResult: User })
      }
      else {
        return res.send({ responseCode: 200, success: true, responseMessage: "Active host get successfully", responseResult: User })
      }
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Something went wrong" })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.upload = async (req, res) => {
  try {
    return res.send({ responseCode: 200, sucess: true, responseMessage: "Villa image upload successfully", responseResult: `${req.file.filename}` })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }

}

exports.updateVilla = async (req, res) => {
  try {
    const reqBody = req.body
    const { villaImages } = reqBody
    if (!villaImages)
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required!" })
    const user = req.user;
    const id = user._id;
    const realPath = path.join(__dirname, '../uploads');
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    const findVilla = await villaModel.find({});
    for (var s of findVilla) {
      var deleted = await villaModel.findOneAndDelete({ _id: s._id });
    }
    const image = await villaModel.create({
      villaImages: villaImages,
    })
    return res.send({ responseCode: 200, sucess: true, responseMessage: "Villa image upload successfully", responseResult: image })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.deleteVilla = async (req, res) => {
  try {
    const reqBody = req.body
    const { villaId } = reqBody
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    if (!villaId)
      return res.send({ responseCode: 200, success: false, responseMessage: "villaId is required" })


    const deleted = await villaModel.findOneAndUpdate(
      { _id: villaId },
      {
        $set: {
          is_deleted: true,
        },
      },
      { new: true }
    );
    return res.send({ responseCode: 200, success: true, responseMessage: "Villa deleted successfully", responseResult: deleted })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.findVilla = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    else {
      const villaData = await villaModel.findOne({})
      if (!villaData) {
        return res.send({ responseCode: 200, sucess: false, responseMessage: "Data not found", responseResult: villaData })
      }
      else {
        return res.send({ responseCode: 200, success: true, responseMessage: "Villa data get successfully", responseResult: villaData })
      }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.villaColour = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body
    const { color } = reqBody
    if (!color) {
      return res.send({ responseCode: 200, success: false, responseMessage: "color is required" })
    }
    else {
      const admin = await adminModel.findOne({ _id: id })
      if (!admin) {
        res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
      }
      else {
        const findColorData = await colourModel.findOne({});
        if (findColorData != null) {
          return res.send({ responseCode: 200, success: true, responseMessage: "You have already created the color, you can update it!" })
        }
        else {
          const colourdata = await colourModel.create({
            color: color
          })
          return res.send({ responseCode: 200, success: true, responseMessage: "Villa colour created successfully", responseResult: colourdata })
        }

      }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.updateVillaColour = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body
    const { color } = reqBody
    if (!color)
      return res.send({ responseCode: 200, success: false, responseMessage: "color is required" })

    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    const findIdForColor = await colourModel.findOne({});
    if (findIdForColor) {
      const colour = await colourModel.findOneAndUpdate({ _id: findIdForColor._id },
        {
          $set: {
            color: color
          }
        },
        { new: true });
      return res.send({ responseCode: 200, success: true, responseMessage: "Villa colour updated  successfully", responseResult: colour })
    }
    else {
      const colourdata = await colourModel.create({
        color: color
      })
      return res.send({ responseCode: 200, success: true, responseMessage: "Villa colour created successfully", responseResult: colourdata })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.deleteColour = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body
    const { colorId } = reqBody
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    if (!colorId)
      return res.send({ responseCode: 200, success: false, responseMessage: "colorId is required" })

    const deleted = await colourModel.findOneAndUpdate(
      { $and: [{ _id: colorId }, { is_deleted: false }] },
      {
        $set: {
          is_deleted: true,
        },
      },
      { new: true }
    );

    return res.send({ responseCode: 200, success: true, responseMessage: "Villa colour updated successfully", responseResult: deleted })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.findColour = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin) {
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    }
    else {
      const colourData = await colourModel.findOne({})
      if (!colourData) {
        return res.send({ responseCode: 200, sucess: false, responseMessage: "Data not found", responseResult: colourData })
      }
      else {
        return res.send({ responseCode: 200, success: true, responseMessage: "Colour data get successfully", responseResult: colourData })
      }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.findFreehost = async (req, res) => {
  try {
    const reqBody = req.body;
    const { shift, date } = reqBody;
    const user = req.user;
    const id = user._id;
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    if (!shift || !date)
      return res.send({ responseCode: 200, success: false, responseResult: "All fileds are mandatory !" })
    const findScheduleJourney = await userRequest.find({ $and: [{ requestedShift: shift }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { appointmentDate: date }] });

    let assingedJourneyHost = [];
    let freeHostList = [];
    if (shift == 'Morning') {

      for (let i = 0; i < findScheduleJourney.length; i++) {
        if (findScheduleJourney[i].startTime >= "09:00" && findScheduleJourney[i].endTime <= "11:00") {
          assingedJourneyHost.push(findScheduleJourney[i].hostId);
        }
      }
    }
    else if (shift == 'Afternoon') {

      for (let i = 0; i < findScheduleJourney.length; i++) {
        if (findScheduleJourney[i].startTime >= "12:00" && findScheduleJourney[i].endTime <= "14:00") {
          assingedJourneyHost.push(findScheduleJourney[i].hostId);
        }
      }
    }
    else if (shift == 'Evening') {


      for (let i = 0; i < findScheduleJourney.length; i++) {
        if (findScheduleJourney[i].startTime >= "15:00" && findScheduleJourney[i].endTime <= "17:00") {
          assingedJourneyHost.push(findScheduleJourney[i]);
        }
      }
    }
    // console.log("assigHost", assingedJourneyHost)
    let hostIdData = ""
    for (let k = 0; k < assingedJourneyHost.length; k++) {

      hostIdData = assingedJourneyHost[k].hostId

    }

    const hostList = await userModel.find();
    for (let i = 0; i < hostList.length; i++) {
      if (String(hostList[i]._id) != String(hostIdData)) {
        freeHostList.push(hostList[i])
      }
    }

    return res.send({ responseCode: 200, success: true, responseMessage: "Free availble host list!", responseResult: freeHostList })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}
const itrations = {
  morning: [9, 10, 11],
  afternoon: [12, 13, 14],
  evening: [15, 16, 17],
}

exports.SearchFreeHost = async (req, res) => {
  try {

    const reqBody = req.body;
    const user = req.user;
    // const id = user._id;
    // const admin = await adminModel.findOne({ _id: id })
    // if (!admin)
    //   return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })

    if (reqBody.journeyCode == null) {

      return res.send({ responseCode: 200, success: false, responseMessage: "journeyCode field required" })
    }

    const searchjourney = await userRequest.findOne({
      $and: [{ journey_code: reqBody.journeyCode }, { isFinished: false },
      { is_deleted: false }, { isSelfJourney: false }]
    });
    if (!searchjourney) {
      return res.send({ responseCode: 200, success: false, responseMessage: "Code journey not found." })
    }
    const findScheduleJourney = await userRequest.find({ $and: [{ isFinished: false }, { is_deleted: false }] });
    var timeMeetings = []


    var shitTiming = itrations.morning;
    if (searchjourney.requestedShift == "Morning") {
      shitTiming = itrations.morning;
    } else if (searchjourney.requestedShift == "Afternoon") {
      shitTiming = itrations.afternoon
    }
    else {
      shitTiming = itrations.evening
    }

    for (var s of findScheduleJourney) {
      var date = FormatDate(searchjourney.appointmentDate)
      var aptDate = FormatDate(s.appointmentDate)
      // console.log("Data to add ", aptDate, s.appointmentDate, date)
      // var hour = moment(s.startTime).format("HH")
      var formatData = moment(aptDate)
      var formatDateReceived = moment(date)
      // console.log("Data journey ", formatData, '\n\n', formatDateReceived)
      var dateQual = moment(formatData).isSame(formatDateReceived)
      //console.log("Schaduled journey ", s.appointmentDate, dateQual, '\n', s)
      //var timedata = reqBody.time.split(':')
      // var storedTime = s.startTime.split(':')
      // var bodyTimeCheck = a
      // var storetimeCheck = storedTime[0]

      // console.log("Schaduled Sgift ", s.requestedShift, searchjourney.requestedShift)
      if (dateQual && s.requestedShift == searchjourney.requestedShift) {
        // console.log("Time ", dateQual)
        //timeMeetings.
        timeMeetings.push(s);
      }



    }
    console.log("\n Data Found ", shitTiming, timeMeetings)


    var firstItration = []
    var secondItration = []
    var thirdItration = []


    const hostContainMeetings = GetHostMeetings(timeMeetings);//.filter(e => e.hostId != null);
    for (let index = 0; index < shitTiming.length; index++) {
      const element = shitTiming[index];
      console.log("Contain Meetings ", hostContainMeetings)
      var allHost = await GetAllHost();

      for (var s of hostContainMeetings) {
        if (s.startTime.split(":")[0] == element) {
          const host = allHost.filter(e => e._id.toString() == s.hostId.toString());
          //  console.log("Searched host", host)
          for (var a of host) {

            allHost = RemoveHost(allHost, a)
          }
        }
      }
      //console.log("After splice", allHost);
      if (index == 0) {
        firstItration = allHost;
      }
      if (index == 1) {
        secondItration = allHost;
      }
      if (index == 2) {
        thirdItration = allHost;
      }
    }

    async function GetAllHost() {
      return await userModel.find({ $and: [{ is_deleted: false, isHost: true }] })

    }


    return res.send({ responseCode: 200, success: true, responseMessage: "Free hosts", responseResult: { firstItration, secondItration, thirdItration } })
  } catch (e) {
    return res.send({ responseCode: 400, success: false, responseMessage: e.message })
  }
}


function RemoveHost(allHost, host) {
  var remain = []
  console.log("receiver", allHost, host)
  for (var s of allHost) {
    console.log("cson ", s._id, host._id)
    if (s._id.toString() == host._id.toString()) {
      continue
    }
    remain.push(s)
  }
  return remain;
}

function GetHostMeetings(allHost) {
  var remain = []

  for (var s of allHost) {
    if (!s.hostId) {
      continue
    }
    remain.push(s)
  }
  return remain;
}

function FormatDate(date) {
  if (date.includes('-')) {
    return date
  }
  const dateStr = date;
  const parts = dateStr.split('/');
  const formattedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);//.toLocaleDateString('en-GB');

  console.log(formattedDate); // Output: 21/09/2023
  return formattedDate;
}

exports.adminSendmail = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body
    const { email } = reqBody
    const admin = await adminModel.findOne({ _id: id })
    if (!admin)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a admin!" })
    if (!email)
      return res.send({ responseCode: 200, success: false, responseMessage: "Email is required" })
    let userdata = await userModel.findOne({ $and: [{ email: email }, { isHost: false }] });
    if (!userdata) {
      return res.send({ reponseCode: 200, success: false, responseMessage: 'User not found.' });
    }
    else {

      transporter.use('compile', hbs(handlebarOptions))

      let adminEmail = await transporter.sendMail({
        from: 'MBR@contact.com',
        to: userdata.email,
        subject: "Slot is not available",
        template: 'JourneySlotUnavailability',
        context: {
          email: "email"
        },
        attachments: [{
          filename: 'appLogo.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/Admin.png`,
          cid: 'Adminpng'
        },
        {
          filename: 'loading.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/Admin-3.png`,
          cid: 'admin3'
        },
        {
          filename: 'discord.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/logo.png`,
          cid: 'logo'
        }, {
          filename: 'fb.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/facebook.png`,
          cid: 'FB'
        }, {
          filename: 'insta.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/instagram.png`,
          cid: 'Insta'
        },
        {
          filename: 'twitter.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/twitter.png`,
          cid: 'Twitter'
        },
        {
          filename: 'twitter.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/snapchat.png`,
          cid: 'snapchat'
        },
        {
          filename: 'twitter.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/web.png`,
          cid: 'web'
        },
        {
          filename: 'twitter.jpg',
          path: `https://metaverse.mbrhe.ae/api/file/path/footerPanel.png`,
          cid: 'footerPanel'
        },]
      });


      // let html = emailBody
      // let Email = email
      // let send = await commonFunction.sendToJourneySlot(Email, html)

      res.send({ responseCode: 200, success: true, responseMessage: "Email sent  successfully!" });

    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.userformsubmissionList = async (req, res) => {
  try {
    const userdata = await userRequest.find({ $and: [{ is_deleted: false }, { isActive: true }, { isSchedule: true }, { isFinished: true }] }).populate();
    if (userdata) {
      return res.send({ responseCode: 200, success: true, responseMessage: "User data get successfully", responseResult: userdata })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.particularJourney = async (req, res) => {
  try {
    const reqBody = req.body
    const { journeyCode } = reqBody
    if (!journeyCode)
      return res.send({ responseCode: 200, success: false, responseMessage: "Feilds are required" })
    const particulardata = await userRequest.findOne({ journey_code: journeyCode });

    return res.send({ responseCode: 200, success: true, responseMessage: "Particular journey get successfully", responseResult: particulardata })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.colourImage = async (req, res) => {
  try {
    let colour = await colourModel.findOne({ is_deleted: false })
    let villa = await villaModel.findOne({});

    return res.send({
      success: true,
      responseMessage: "Data get successfully",
      Image: villa,
      color: colour
    });
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}


exports.AdminSendTestMail = async (req, res) => {
  transporter.use('compile', hbs(handlebarOptions))
  var address = req.body.address;

  let adminEmail = await transporter.sendMail({
    from: 'MBR@contact.com',
    to: address,
    subject: "Slot is not available",
    template: 'JourneySlotUnavailability',
    context: {
      email: "email"
    },
    attachments: [{
      filename: 'appLogo.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/Admin.png`,
      cid: 'Adminpng'
    },
    {
      filename: 'loading.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/Admin-3.png`,
      cid: 'admin3'
    },
    {
      filename: 'discord.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/logo.png`,
      cid: 'logo'
    }, {
      filename: 'fb.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/facebook.png`,
      cid: 'FB'
    }, {
      filename: 'insta.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/instagram.png`,
      cid: 'Insta'
    },
    {
      filename: 'twitter.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/twitter.png`,
      cid: 'Twitter'
    },
    {
      filename: 'twitter.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/snapchat.png`,
      cid: 'snapchat'
    },
    {
      filename: 'twitter.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/web.png`,
      cid: 'web'
    },
    {
      filename: 'twitter.jpg',
      path: `https://metaverse.mbrhe.ae/api/file/path/footerPanel.png`,
      cid: 'footerPanel'
    },]
  });


  res.send({ Data: adminEmail })
}

exports.DeleteTempMail = async (req, res) => {

  try {
    var email = req.body.email
    var del = await userModel.findOneAndDelete({ email: email });
    res.send({ delete: del })
  }
  catch (e) {
    res.send({ data: e.message })
  }
}
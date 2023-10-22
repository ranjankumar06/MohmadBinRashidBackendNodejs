const hostModel = require("../model/hostModel")
const nodeMailer = require("nodemailer");
const userRequest = require("../model/userrequestModel")
const userModel = require("../model/userModel")
const jwt = require("jsonwebtoken")
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config()
const hbs = require('express-handlebars');
const { v4: uuidv4 } = require('uuid');
const config = require("../config/config");
const path = require("path")
const userFormModel = require("../model/formsubmissionModel")
const commonFunction = require('../middleware/commonFunction');
const nodemailer = require("nodemailer");
const express = require("express");
const viewPath = path.resolve(__dirname, '../views');
const partialsPath = path.resolve(__dirname, "../views/partials");
const fs = require('fs');
const handlebars = require('handlebars');
const moment = require('moment')

const adminModel = require("../model/adminModel");
// Read the template file
const templateSource = fs.readFileSync('views/resettingYourPassword.handlebars', 'utf8');
// Compile the template
const template = handlebars.compile(templateSource)
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

exports.hostLogin = async (req, res) => {
  try {
    const reqBody = req.body
    const { email, password } = reqBody
    if (!email || !password) {
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required !" });
    }
    let hostData = await hostModel.findOne({ email: email });
    if (!hostData)
      return res.send({ reponseCode: 200, success: false, responseMessage: 'Email not found.' });

    if (hostData.is_deleted == true)
      return res.send({ reponseCode: 200, success: false, responseMessage: 'Host doesn`t exist!' });

    const accessToken = jwt.sign(
      {
        success: true,
        message: "User detail !",
        user: {
          _id: hostData._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );


    let passCheck = bcrypt.compareSync(req.body.password, hostData.password);
    if (!passCheck) {
      return res.send({ reponseCode: 200, success: false, responseMessage: 'Incorrect password.', })
    }
    else {
      return res.send({ reponseCode: 200, success: true, responseMessage: 'Host login Successfully', responseResult: hostData, token: accessToken },);
    }


  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong!", });
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const reqBody = req.body
    const { email } = reqBody
    if (!email)
      return res.send({ responseCode: 200, success: false, responseMessage: "Email is required !" });


    const verificationtoken = uuidv4();
    // if (req.body.role == 'admin') {
    let findAdmin = await adminModel.findOne({ email: email });

    if (!findAdmin) {
      return res.send({ reponseCode: 200, success: false, responseMessage: 'Email does not exist !.' });
    }
    else {
      const updateResetCodeAdmin = await adminModel.findOneAndUpdate({ email: email },
        {
          $set: {
            code: verificationtoken
          }
        }, { new: true })

      const verificationURL = `https://metaverse.mbrhe.ae/api/reset/password?id=${verificationtoken}`;

      // const emailBody = template({
      //   link: verificationURL
      // });

      // let sendEmail = email
      // let html = emailBody

      // let send = await commonFunction.sendToForgotPassword(sendEmail, html)
      let adminEmail = await transporter.sendMail({
        from: 'MBR@contact.com',
        to: email,
        subject: "Reset you password",
        template: 'resettingYourPassword',
        context: {
          verificationURL: verificationURL,
          userName: email
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

      return res.send({ responseCode: 200, success: true, responseMessage: "Reset password link send to your email" });



      // } else if (req.body.role == 'user') {
      //   let findUser = await userModel.findOne({ email: email });
      //   if (!findUser) {
      //     return res.send({ reponseCode: 200, success: false, responseMessage: 'Email does not exist !.' });
      //   } else {
      //     const updateUserResetCode = await userModel.findOneAndUpdate({ email: email },
      //       {
      //         $set: {
      //           code: verificationtoken
      //         }
      //       }, { new: true })

      //     const verificationURL = `https://metaverse.mbrhe.ae/api/reset-password?id=${verificationtoken}`;

      //     const emailBody = template({
      //       link: verificationURL
      //     });

      //     let sendEmail = email
      //     let html = emailBody

      //     let send = await commonFunction.sendToForgotPassword(sendEmail, html)
      //     return res.send({ responseCode: 200, success: true, responseMessage: "Email sent for forgot password verification successfully!" });

      //   }

      // }
      // else if (req.body.role == 'host') {
      //   let findHost = await hostModel.findOne({ email: email });
      //   if (!findHost) {
      //     return res.send({ reponseCode: 200, success: false, responseMessage: 'Email does not exist !.' });
      //   }
      //   else {
      //     const updateHostResetCode = await hostModel.findOneAndUpdate({ email: email },
      //       {
      //         $set: {
      //           code: verificationtoken
      //         }
      //       }, { new: true })

      //     const verificationURL = `https://metaverse.mbrhe.ae/api/reset-password?id=${verificationtoken}`;

      //     const emailBody = template({
      //       link: verificationURL
      //     });


      //     let sendEmail = email
      //     let html = emailBody

      //     let send = await commonFunction.sendToForgotPassword(sendEmail, html)
      //     return res.send({ responseCode: 200, success: true, responseMessage: "Email sent for forgot password verification successfully!" });

      //   }

      // }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: "Something went wrong!", });
  }
}

exports.update_notAttended = async (req, res) => {
  try {
    const reqBody = req.body
    const { journeyCode, isHost } = reqBody

    if (!journeyCode || !isHost)
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds  is required" })

    if (isHost == false) {
      const result = await userRequest.findOneAndUpdate(
        { journey_code: journeyCode },
        {
          $set: {
            notAttended: true
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
            notAttended: true
          },
        },
        { new: true }
      );
      return res.send({ responseCode: 200, success: true, responseMessage: "User didn't  attended ", responseResult: result })
    }

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}


exports.hostJourney = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const host = await userModel.findOne({ $and: [{ _id: id }, { isHost: true }] });
    if (!host)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a host!" })
    const userData = await userRequest.find({ $and: [{ hostId: host._id }, { isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] }).populate('hostId')

    return res.send({ responseCode: 200, success: true, responseMessage: "Host get successfully", responseResult: userData })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}


exports.hostMonthWiseJourney = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const query = req.query;
    const host = await userModel.findOne({ $and: [{ _id: id }, { isHost: true }] })
    if (!host)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a host!" })


    const finishedHost = await userRequest.find({ $and: [{ hostId: id }, { isFinished: true }, { is_deleted: false }] })
    const activeHost = await userRequest.find({ $and: [{ hostId: id }, { isActive: true }, { is_deleted: false }, { isFinished: false }] })
    const notattendHost = await userRequest.find({ $and: [{ hostId: id }, { notAttended: true }, { is_deleted: false }] })
    const upcommingHost = await userRequest.find({ $and: [{ hostId: id }, { isSchedule: true }, { is_deleted: false }, { isActive: false }, { isFinished: false }] })
    const count = {
      finishd: finishedHost.length,
      active: activeHost.length,
      notAttended: notattendHost.length,
      upcomming: upcommingHost.length
    }
    const userdata = await userRequest.find({ hostId: id });
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
    if (userdata.length > 0) {
      return res.send({ responseCode: 200, success: true, responseMessage: `Host data get month wise successfully`, responseResult: filterData, count: count })
    }
    else if (!req.query.month) {
      return res.send({ responseCode: 200, success: false, responseMessage: "Data not found", responseResult: filterData })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Not found", responseResult: filterData })
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
    const user = req.user;
    const id = user._id;
    const host = await hostModel.findOne({ _id: id })
    if (!host) {
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a host!" })
    }
    else {
      const userData = await userRequest.find({ $and: [{ isActive: false }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: true }] })
      if (userData.length > 0) {
        return res.send({ responseCode: 200, success: true, responseMessage: "Unattened host get successfully", responseResult: userData })
      }
      else {
        return res.send({ responseCode: 200, success: false, responseMessage: "Unattened host not found", responseResult: userData })
      }
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.activeHostJourney = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const host = await userModel.findOne({ $and: [{ _id: id }, { isHost: true }] })
    if (!host)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a host!" })

    const User = await userRequest.find({ $and: [{ hostId: host._id }, { isActive: true }, { isSchedule: true }, { isFinished: false }, { is_deleted: false }, { notAttended: false }] })

    return res.send({ responseCode: 200, success: true, responseMessage: "Active host get successfully", responseResult: User })

  }

  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const code = req.query.id;
    // const findHost = await hostModel.findOne({ code: code });
    // const findUser = await userModel.findOne({ code: code });
    const findAdmin = await adminModel.findOne({ code: code });
    if (findHost) {
      res.render('resetPassword');
    }
    else if (findUser) {
      res.render('resetPassword');
    }
    else if (findAdmin) {
      res.render('resetPassword');
    }
    else {
      res.send({ responseCode: 200, success: false, responseResult: "This link does not exist !" })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })

  }
}

exports.updatePassword = async (req, res) => {
  try {
    const reqBody = req.body;
    const { password } = reqBody;
    if (!password)
      return res.send({ responseCode: 200, success: false, responseMessage: "All feilds are required!" })

    const id = req.params;
    // console.log("RandomCode", reqBody)
    // const hostdata = await hostModel.findOne({ code: code })
    // const userdata = await userModel.findOne({ code: code })
    const admindata = await adminModel.findOne({ code: id })
    let hashPassword = null;
    // if (userdata) {
    //   hashPassword = bcrypt.hashSync(password)
    //   let userUpdate = await userModel.findOneAndUpdate(
    //     { _id: userdata._id },
    //     {
    //       $set: {
    //         password: hashPassword,
    //         code: ""
    //       }
    //     },
    //     { new: true }
    //   )
    //   return res.send({ responseCode: 200, success: true, responseMessage: "User password updated successfully", responseResult: userUpdate })
    // }
    // else if (hostdata) {
    //   hashPassword = bcrypt.hashSync(password)
    //   let hostUpdate = await hostModel.findOneAndUpdate(
    //     { _id: hostdata._id },
    //     {
    //       $set: {
    //         password: hashPassword,
    //         code: ""
    //       }
    //     },
    //     { new: true }
    //   )
    //   return res.send({ responseCode: 200, success: true, responseMessage: "Host password updated successfully", responseResult: hostUpdate })
    // }
    if (admindata) {
      hashPassword = bcrypt.hashSync(password)
      let adminUpdate = await adminModel.findOneAndUpdate(
        { _id: admindata._id },
        {
          $set: {
            password: hashPassword,
            code: ""
          }
        },
        { new: true }
      )
      return res.send({ responseCode: 200, success: true, responseMessage: "Host password updated successfully", responseResult: adminUpdate })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "Data in not found", responseResult: adminUpdate })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.userformsubmissionList = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const host = await userModel.findOne({ $and: [{ _id: id }, { isHost: true }] })
    if (!host)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a host!" })

    const userdata = await userRequest.find({})

    return res.send({ responseCode: 200, success: true, responseMessage: "User data get successfully", responseResult: userdata })

  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}

exports.particularJourney = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body
    const { journeyId } = reqBody
    const host = await userModel.findOne({ $and: [{ _id: id }, { isHost: true }] })
    if (!host)
      return res.send({ responseCode: 200, success: false, responseMessage: "You are not a host!" })

    if (!journeyId)
      return res.send({ responseCode: 200, success: false, responseMessage: "Journey not found" })
    const particulardata = await userRequest.findOne({ $and: [{ journey_code: journeyId }, { hostId: host._id }] });
    if (particulardata) {
      return res.send({ responseCode: 200, success: true, responseMessage: "Particular journey get successfully", responseResult: particulardata })
    }
    else {
      return res.send({ responseCode: 200, success: false, responseMessage: "This not your journey" })
    }
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}


exports.hostJoin = async (req, res) => {
  try {
    const reqBody = req.body
    const { journeyCode } = reqBody
    if (!journeyCode)
      return res.send({ responseCode: 200, success: false, responseMessage: "Journey code is required" })
    const findJourneyCode = await userRequest.findOne({ journey_code: journeyCode })
    if (!findJourneyCode)
      return res.send({ responseCode: 200, success: false, responseMessage: "Journey not found!" })
    const findHost = await hostModel.findOne({ _id: findJourneyCode.hostId })
    const accessToken = jwt.sign(
      {
        success: true,
        message: "Host detail !",
        user: {
          _id: findHost._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    return res.send({ responseCode: 200, success: true, responseMessage: "Host join successfully", responseResult: findHost, isHost: true, token: accessToken })
  }
  catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message })
  }
}
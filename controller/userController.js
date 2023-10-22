const userModel = require("../model/userModel");
const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv").config();
const userRequest = require("../model/userrequestModel");
const customizeModel = require("../model/customizeModel");
const userFormModel = require("../model/formsubmissionModel");
const commonFunction = require("../middleware/commonFunction");
const hostModel = require("../model/hostModel");
const cron = require("node-cron");
const config = require("../config/config");
const hbs = require('nodemailer-express-handlebars');
const moment = require("moment");
const temporaryEmailValidator = require("deep-email-validator");
const { validationResult } = require("express-validator");
const path = require("path");
const publicDirectory = path.join(__dirname, "../speech");
const fs = require("fs");
const handlebars = require("handlebars");
const adminModel = require("../model/adminModel");
const express = require("express");
const nodemailer = require("nodemailer");
const Agora = require("agora-access-token");
const viewPath = path.resolve(__dirname, '../views');
const partialsPath = path.resolve(__dirname, "../views/partials");
// const templateSource = fs.readFileSync('views/selfjourney.handlebars', 'utf8');
// const templateSelfjourney = handlebars.compile(templateSource)

// const templateSourceuserform = fs.readFileSync('views/thankyouFrom.handlebars', 'utf8');
// const templatefrom = handlebars.compile(templateSourceuserform)
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



// self journey register
exports.userSignup = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email, userName, mobileNumber } = reqBody;
    if (!email || !userName)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "All feilds are required !",
      });

    const adminData = await adminModel.findOne({});
    const isTemporary = await temporaryEmailValidator.validate(email);

    let result = await userModel.findOne({ email: email });
    if (result)
      return res.send({
        reponseCode: 200,
        success: false,
        responseMessage: "Email already exists",
      });

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "Invalid email",
      });
    else {
      const user = new userModel();

      (user.userName = userName),
        (user.email = email),
        (user.mobileNumber = mobileNumber),
        await user.save();
      const accessToken = jwt.sign(
        {
          success: true,
          message: "User detail !",
          user: {
            _id: user._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      const findAdminMail = await adminModel.findOne({})
      transporter.use('compile', hbs(handlebarOptions))
      let adminEmail = await transporter.sendMail({
        from: 'MBR@contact.com',
        to: email,
        subject: "You have registered your self successfully",
        template: 'selfjourney',
        context: {
          email: email,
          mobileNumber: mobileNumber,
          userName: userName
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
      // const emailBody = templateSelfjourney({
      //     email: email,
      //     mobileNumber: mobileNumber,
      //     userName: userName,
      // });

      // const transporter = nodeMailer.createTransport({
      //     service: 'gmail',
      //     host: 'smtp.gmail.com',
      //     port: 465,
      //     secure: false,
      //     requireTLS: true,
      //     auth: {
      //         user: config.emailUser,
      //         pass: config.emailPass,
      //     },
      // });

      // const verificationURL = `https://metaverse.mbrhe.ae/api/user/verify/email?id=${verificationtoken}`;

      // const mailOptions = {
      //     from: config.emailUser,
      //     to: email,
      //     subject: 'Self journey mail',
      //     html: emailBody,

      // }

      // const mailtoadmin = {
      //     from: config.emailUser,
      //     to: "ranjan.abhiwan01@gmail.com",
      //     subject: 'User self journey mail.',
      //     html: emailBody,

      // }

      // transporter.sendMail(mailOptions, (error, info) => {
      //     if (error) {
      //         console.error("Error sending email:", error);
      //     } else {
      //         res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!" });
      //         console.log("Email sent successfully:", info.response);

      //     }
      // })

      // transporter.sendMail(mailtoadmin, (error, info) => {
      //     if (error) {
      //         console.error("Error sending email:", error);
      //     } else {
      //         res.send({ responseCode: 200, success: true, responseMessage: "Email sent successfully!" });
      //         console.log("Email sent successfully:", info.response);

      //     }
      // })

      // let html = emailBody
      // let emialUser = email
      // let emailAdmin = adminData.email

      // let send = await commonFunction.sendSelfJourneyUser(emialUser, html)
      // let sendsecond = await commonFunction.sendSelfJourneyToAdmin(emailAdmin, html)
      res.send({
        responseCode: 200,
        success: true,
        responseMessage: "User  registered successfully !",
        token: accessToken,
      });
    }
  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message });
  }
};

// User and Host Login for start/Join Journey
exports.joinJourney = async (req, res) => {
  try {
    const user = req.user;
    const id = user._id;
    const reqBody = req.body;
    const { isHost, journeyCode } = reqBody;
    const data = await userModel.findOne({
      $and: [{ _id: id }, { is_deleted: false }],
    });
    console.log("JourneyCode,", data, "token ", id, "user ", reqBody);
    if (!data)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "Token is not valid!",
      });

    if (isHost == false) {
      let userData = await userModel.findOne({
        $and: [{ _id: data._id }, { isHost: false }],
      });
      if (!userData) {
        return res.send({
          reponseCode: 200,
          success: false,
          responseMessage: "Email not found.",
        });
      } else {

        const findUserJourney = await userRequest.findOne({
          $and: [
            { email: userData.email },
            { journey_code: journeyCode },
            { notAttended: false },
            { isFinished: false },
          ],
        });
        if (findUserJourney == null) {
          return res.send({
            reponseCode: 200,
            success: false,
            responseMessage: "Journey not found Or Completed.",
          });
        } else {
          const currentUtcTime = moment().utc().format("HH:mm");
          const startTime = findUserJourney.startTime;
          let mins = moment
            .utc(
              moment(currentUtcTime, "HH:mm").diff(moment(startTime, "HH:mm"))
            )
            .format("mm");
          console.log("Journey time ", mins, currentUtcTime, startTime)
          if (findUserJourney && mins < 20) {
            const updateIsActive = await userRequest.findOneAndUpdate(
              { journey_code: journeyCode },
              {
                $set: {
                  isActive: true,
                },
              },
              { new: true }
            );
            const accessToken = jwt.sign(
              {
                success: true,
                message: "User detail !",
                user: {
                  userId: findUserJourney.user_id,
                  userName: findUserJourney.userName,
                  email: findUserJourney.email,
                  journeyCode: findUserJourney.journey_code,
                },
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "1d" }
            );
            return res.send({
              responseCode: 200,
              success: true,
              responseMessage: "You have logged in journey successfully",
              responseResult: updateIsActive,
              token: accessToken,
            });
          } else {
            const updateIsActive = await userRequest.findOneAndUpdate(
              { journey_code: journeyCode },
              {
                $set: {
                  isFinished: true,
                },
              },
              { new: true }
            );
            return res.send({
              responseCode: 200,
              success: false,
              responseMessage:
                "Journey does not exist or Journey has been expired!",
            });
          }
        }
      }
    } else if (isHost == true) {
      const findHost = await userModel.findOne({
        $and: [{ _id: data._id }, { isHost: true }],
      });
      if (!findHost) {
        return res.send({
          reponseCode: 200,
          success: false,
          responseMessage: "Email not found.",
        });
      } else {
        const findHostJourney = await userRequest.findOne({
          $and: [
            { hostId: findHost._id },
            { journey_code: journeyCode },
            { isSchedule: true },
            { isFinished: false },
            { notAttended: false },
          ],
        });
        if (findHostJourney == null) {
          return res.send({
            reponseCode: 200,
            success: false,
            responseMessage: "Journey not found Or Completed.",
          });
        } else {
          const currentUtcTime = moment().utc().format("HH:mm");
          const startTime = findHostJourney.startTime;
          let mins = moment
            .utc(
              moment(currentUtcTime, "HH:mm").diff(moment(startTime, "HH:mm"))
            )
            .format("mm");

          if (findHostJourney && mins < 20) {
            const updateIsActive = await userRequest.findOneAndUpdate(
              { journey_code: journeyCode },
              {
                $set: {
                  isActive: true,
                },
              },
              { new: true }
            );
            const Token = jwt.sign(
              {
                success: true,
                message: "Host detail !",
                user: {
                  hostId: findHostJourney.hostId,
                  email: findHost.email,
                  journeyCode: findHostJourney.journey_code,
                },
              },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "1d" }
            );
            return res.send({
              responseCode: 200,
              success: true,
              responseMessage: "Host created successfully",
              responseResult: updateIsActive,
              token: Token,
            });
          } else {
            return res.send({
              responseCode: 200,
              success: false,
              responseMessage:
                "Journey does not exist or Journey has been expired!",
            });
          }
        }
      }
    }
  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const reqBody = req.body;
    console.log("reqBody", reqBody);
    const { email, password, isHost } = reqBody;
    if (!email)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "All feilds are reuired!",
      });
    if (isHost == false) {
      let userData = await userModel.findOne({
        $and: [{ email: email }, { isHost: false }, { is_deleted: false }],
      });
      if (!userData)
        return res.send({
          reponseCode: 200,
          success: false,
          responseMessage: "User does not exist",
        });
      const accessToken = jwt.sign(
        {
          success: true,
          message: "User detail !",
          user: {
            _id: userData._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      return res.send({
        responseCode: 200,
        success: true,
        responseMessage: "User login successfully",
        responseResult: userData,
        token: accessToken,
      });
    } else if (isHost == true) {
      const findHost = await userModel.findOne({
        $and: [{ email: email }, { isHost: true }, { is_deleted: false }],
      });

      if (findHost) {
        if (!password)
          return res.send({
            responseCode: 200,
            success: false,
            responseMessage: "Please, fill the password!",
          });
        let passCheck = bcrypt.compareSync(password, findHost.password);
        if (passCheck == false) {
          return res.send({
            reponseCode: 200,
            success: false,
            responseMessage: "Incorrect password.",
          });
        } else {
          const Token = jwt.sign(
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
          return res.send({
            responseCode: 200,
            success: true,
            responseMessage: "Login successfully",
            responseResult: findHost,
            token: Token,
          });
        }
      } else {
        const hostData = await userModel.create({
          userName: "Host",
          email: email,
          isHost: true,
          password: bcrypt.hashSync(password),
        });
        const Token = jwt.sign(
          {
            success: true,
            message: "Host detail !",
            user: {
              _id: hostData._id,
              email: hostData.email,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        return res.send({
          responseCode: 200,
          success: true,
          responseMessage: "Host created successfully",
          responseResult: hostData,
          token: Token,
        });
      }
    }
  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message });
  }
};

exports.loginWithEmailJourneyCode = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email, journey_code } = reqBody;
    if (!email || !journey_code)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "Email is required",
      });
    const findTime = await userRequest.findOne({
      $and: [
        { email: email },
        { journey_code: journey_code },
        { isSchedule: true },
        { isActive: false },
        { notAttended: false },
        { is_deleted: false },
      ],
    });
    if (!findTime)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "User journy not found",
      });
    const currentUtcTime = moment().utc().format("HH:mm");
    const startTime = findTime.startTime;
    let mins = moment
      .utc(moment(currentUtcTime, "HH:mm").diff(moment(startTime, "HH:mm")))
      .format("mm");

    console.log(mins);
    if (mins > 20) {
      res.send({
        reponseCode: 200,
        success: false,
        responseMessage: "Journey has been expired!",
      });
    } else {
      const result = await userRequest.findOneAndUpdate(
        { journey_code: journey_code },
        {
          $set: {
            isActive: true,
          },
        },
        { new: true }
      );

      const accessToken = jwt.sign(
        {
          success: true,
          message: "User detail !",
          user: {
            // email: findTime.email,
            // journey_code: findTime.journey_code,
            // mobileNumber: findTime.mobileNumber,
            // userName: findTime.userName,
            _id: findTime._id,
            // appointmentDate: findTime.appointmentDate,
            // startTime: findTime.startTime,
            // hostId: findTime.hostId,
            // endTime: findTime.endTime,
            // villa: findTime.villa,
            // duration: findTime.duration,
            // isSchedule: findTime.isSchedule,
            // isActive: findTime.isActive,
            // isFinished: findTime.isFinished,
            // journeyType: findTime.journeyType,
            // notAttended: findTime.notAttended,
            // is_deleted: findTime.is_deleted,
            // requestedShift: findTime.requestedShift
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      return res.send({
        reponseCode: 200,
        success: true,
        responseMessage: "User login Successfully",
        responseResult: findTime,
        token: accessToken,
      });
    }
  } catch (error) {
    return res.send({ responseCode: 400, responseMessage: error.message });
  }
};

// exports.verifyEmail = async (req, res) => {
//     try {

//         const verficationCode = req.query.id;
//         const findUser = await userModel.findOne({ verificationToken: verficationCode });
//         if (!findUser)
//             return res.send({ responseCode: 200, success: false, responseMessage: "This verfication link does not exist !" });

//         const updateUser = await userModel.findOneAndUpdate({ _id: findUser._id },
//             {
//                 $set: {
//                     verificationToken: "",
//                     isVerify: true
//                 }
//             },
//             { new: true });
//         res.status(200).json({ success: true, message: "user verify !" });
//     }

//     catch (error) {
//         return res.send({ responseCode: 400, responseMessage: error.message })
//     }
// }

exports.userJourney = async (req, res) => {
  try {
    const reqBody = req.body;
    const { journeyId } = reqBody;
    const user = req.user;
    const id = user._id;
    const data = await userModel.findOne({ _id: id });
    if (!data)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "User not found!",
      });

    if (!journeyId)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: " Journey Id is required ! ",
      });

    const findJourney = await userRequest.findOne({ journey_code: journeyId });
    if (!findJourney)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: " Journey does not exist ! ",
      });

    const userJourney = await userRequest.findOneAndUpdate(
      { journey_code: journeyId },
      {
        $set: {
          isActive: true,
        },
      },
      { new: true }
    );
    return res.send({
      responseCode: 200,
      success: true,
      responseMessage: "User started journey successfuly",
      responseResult: userJourney,
    });
  } catch (error) {
    return res.send({ responseCode: 400, success: false, responseMessage: error.message });
  }
};

exports.checkemail = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email } = reqBody;
    const userFind = await userModel.findOne({ email: email });
    if (!email)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "Email address is required",
      });
    if (userFind)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "This email is already in use!",
      });

    const isTemporary = await temporaryEmailValidator.validate(email);
    return res.send({ responseCode: 200, success: false, email, isTemporary });
  } catch (error) {
    return res.send({ responseCode: 400, success: false, responseMessage: error.message });
  }
};

exports.selfJourney = async (req, res) => {
  try {
    const reqBody = req.body;
    const {
      journey_code,
      villa,
      villaTiming,
      startTime,
      endTime,
      journeyType,
      email,
    } = reqBody;
    if (!journey_code || !villa || !villaTiming)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "All fileds are required!",
      });

    const data = await userModel.findOne({ email: email });
    if (!data)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "Email not found.",
      });

    const journey = await userRequest.create({
      isFinished: true,
      villa: villa,
      villaTiming: villaTiming,
      email: data.email,
      mobileNumber: data.mobileNumber,
      userName: data.userName,
      startTime: startTime,
      endTime: endTime,
      isSchedule: true,
      isActive: true,
      journeyType: journeyType,
      notAttended: true,
    });
    return res.send({
      responseCode: 200,
      success: true,
      responseMessage: "User self journey data updated successfully",
      responseResult: journey,
    });
  } catch (error) {
    return res.send({ responseCode: 400, success: false, responseMessage: error.message });
  }
};

exports.customize = async (req, res) => {
  try {
    const reqBody = req.body;
    const { userId, jsonValue } = reqBody;
    if (!userId || !jsonValue)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "All felids are required!",
      });

    const data = await customizeModel.findOne({});
    if (data) {
      const customizeData = await customizeModel.findOneAndUpdate(
        { _id: data._id },
        {
          $set: {
            jsonValue: jsonValue,
          },
        },
        { new: true }
      );

      return res.send({
        responseCode: 200,
        success: true,
        responseMessage: "customize updated successfully",
        responseResult: customizeData,
      });
    } else {
      const user = await customizeModel.create({
        userId: userId,
        jsonValue: jsonValue,
        firstTime: true,
      });
      return res.send({
        responseCode: 200,
        success: true,
        responseMessage: "customize create successfully",
        responseResult: user,
      });
    }
  } catch (error) {
    return res.send({ responseCode: 400, success: false, responseMessage: error.message });
  }
};

exports.formsubmission = async (req, res) => {
  try {
    const reqBody = req.body;
    const user = req.user;
    const authUser = user._id;

    // const { journeyCode, villaexteriorwallcolour, livingroomwall, livingroomfloor, bedroomwall, bedroomfloor, kitchenwall, kitchenfloor, kitchenbacksplash, washroomwall, washroomfloor, showerfloor } = req.body
    // if (!journeyCode || !villaexteriorwallcolour || !livingroomwall || !livingroomfloor || !bedroomfloor || !bedroomwall || !kitchenwall || !kitchenfloor || !kitchenbacksplash || !washroomwall || !washroomfloor || !showerfloor)
    //     return res.send({ responseCode: 200, success: false, responseMessage: "All fileds are required!" });

    const { journeyCode, feedback } = reqBody;
    if (!journeyCode || !feedback)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "All fileds are required!",
      });
    const data = await userModel.findOne({ _id: authUser });
    if (!data)
      return res.send({
        responseCode: 200,
        success: false,
        responseMessage: "Email not found!",
      });
    const findJourney = await userRequest.findOne({
      $and: [
        { journey_code: journeyCode },
        { isActive: true },
        { isFinished: false },
        { notAttended: false },
      ],
    });
    if (findJourney) {
      const journey = await userRequest.findOneAndUpdate(
        { _id: findJourney._id },
        {
          $push: {
            feedback: feedback,
          },
        },
        { new: true }
      );

      // const emailBody = templatefrom({
      //     email: email,
      //     journeyId: journeyId,
      //     userName: data.userName
      // });

      // const transporter = nodeMailer.createTransport({
      //     service: 'gmail',
      //     host: 'smtp.gmail.com',
      //     port: 465,
      //     secure: false,
      //     requireTLS: true,
      //     auth: {
      //         user: config.emailUser,
      //         pass: config.emailPass,
      //     },
      // });
      // const mailOptions = {
      //     from: config.emailUser,
      //     to: "ranjan.abhiwan01@gmail.com",
      //     subject: 'Thanks for your form submission',
      //     html: emailBody,
      // }

      // const mailUser = {
      //     from: config.emailUser,
      //     to: data.email,
      //     subject: 'Thanks for your form submission',
      //     html: emailBody,
      // }
      // let html = emailBody
      // let Email = email
      // let adminEmail = adminData.email

      // console.log(adminEmail);
      // let send = await commonFunction.sendTouser(Email, html)
      // let sendToAdmin = await commonFunction.sendAdmin(html, adminEmail)

      return res.send({
        responseCode: 200,
        success: true,
        responseMessage: "Email sent successfully!",
        responseResult: journey,
      });
    } else {
      return res.send({
        responseCode: 200,
        success: true,
        responseMessage: "Journey does not exits",
      });
    }
  } catch (error) {
    return res.send({ responseCode: 400, success: false, responseMessage: error.message });
  }
};

// node cron for finish journey
const cronSchedule = "*/5 * * * *"; // Runs every minute

// Create a cron job
const task = cron.schedule(cronSchedule, async () => {
  // await deleteFile();
  await finsishSelfJourney();
  // await finishRequestJourney();
});

// const deleteFile = async ()

const finishRequestJourney = async () => {
  try {
    const finishRequestJourney = await userRequest.find({
      $and: [{ isSelfJourney: false }, { isFinished: false }],
    });
    for (let i = 0; i < finishRequestJourney.length; i++) {
      const date = finishRequestJourney.appointmentDate;
      const time = finishRequestJourney.startTime;

      var check = moment(date, 'YYYY/MM/DD');

      var month = check.format('MM');
      var day = check.format('D');
      var year = check.format('YYYY');
      // const da = date.split("/");
      const as = time.split(":");
      const date1 = new Date(`${da[year]}-${da[month]}-${da[day]}T${as[0]}:${as[1]}:00`);
      const date2 = new Date();
      const timeDifferenceMs = date2 - date1;
      if (startTime == 50) {
        const updateIsFinished = await userRequest.findOneAndUpdate(
          { _id: finishRequestJourney._id },
          {
            $: {
              isFinished: true,
              endTime: moment().format("HH:mm"),
            },
          },
          { new: true }
        );
      } else {
        console.log("Journey in not finished");
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteFile = async () => {
  try {
    const utcTime = moment().format("HH:mm");
    console.log("utcTime", utcTime)
    if (utcTime == "00:00") {
      const filePathDelete = path.join(__dirname, "../../speech");
      fs.unlink(filePathDelete, (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('Files in directory:', files); // Shows all the files in the directory.
      });
    } else {
      // const filePathDelete = path.join(__dirname, "../speech");
      // console.log("fileDelet pastch", filePathDelete)
      console.log("File is not deleted");
    }
  } catch (error) {
    console.log(error);
  }
};

const finsishSelfJourney = async () => {
  try {
    const finishRequestJourney = await userRequest.find({
      $and: [{ isSelfJourney: true }, { isFinished: false }],
    });
    for (let i = 0; i < finishRequestJourney.length; i++) {
      const date1 = finishRequestJourney.createdAt;
      // const time = finishRequestJourney.startTime
      // const da = date.split('/')
      // const as = time.split(':')
      // const date1 = new Date(`${da[2]}-${da[1]}-${da[0]}T${as[0]}:${as[1]}:00`);
      const date2 = new Date();
      const timeDifferenceMs = date2 - date1;
      if (timeDifferenceMs == 24) {
        const updateIsFinished = await userRequest.findOneAndUpdate(
          { _id: finishRequestJourney[i]._id },
          {
            $: {
              isFinished: true,
              endTime: moment().format("HH:mm"),
            },
          },
          { new: true }
        );
      } else {
        console.log("Journey in not finished");
      }
    }
  } catch (error) {
    console.log(error);
  }
};




exports.GetAgoraToken = async (req, res) => {
  try {
    const appId = req.body.appId;
    const certificate = req.body.certificate;
    const channelName = req.body.channelName;
    const uid = req.body.uid;
    const roleId = req.body.roleId;
    const timeDuration = req.body.timeDuration;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimestamp = currentTimestamp + timeDuration;
    const token = Agora.RtcTokenBuilder.buildTokenWithUid(appId, certificate, channelName, uid, roleId, expirationTimestamp);
    console.log("Generated token>>" + token);

    res.status(200).json({ success: true, rtcToken: token });
  }
  catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
}
const express = require("express");
const multer = require('multer');
const adminController = require("../controller/adminController");
const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { body } = require('express-validator');
const dotenv = require('dotenv').config()

const path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads'); // Set the destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const fileName = Date.now() + extension;
        cb(null, fileName); // Save the file with a unique name and original file extension
    }
});

const upload = multer({ storage: storage })

const admin_router = express.Router();

admin_router.post("/login", adminController.adminLogin)
admin_router.post("/assign/schedule", auth, adminController.assignSchedule)
admin_router.get("/request/journey/list", auth, adminController.scheduleList)

// admin create host
// admin_router.post("/create/host", auth, adminController.createHost)
admin_router.post("/host/create", [body('email').isEmail().withMessage('Invalid email')], auth, adminController.createHost)
admin_router.post("/host/update", [body('email').isEmail().withMessage('Invalid email')], auth, adminController.updateHost)
admin_router.post("/delete/host", auth, adminController.deleteHost)
admin_router.get("/hostList", auth, adminController.hostList)
admin_router.get("/userList", auth, adminController.userList)

// Admin journey api

admin_router.get("/journey/list", auth, adminController.userUpcommingList)
admin_router.post("/user/month", auth, adminController.usermonthWiseList);
admin_router.get("/monthWiseList", auth, adminController.monthWiseList);


// User journey api
admin_router.post("/upcomming/userJourney", auth, adminController.upcommingUserJourney)
// admin_router.post("/userMonth/wiseJourney", auth, adminController.monthWiseJourneyUser)
// admin_router.post("/userActive/journey", auth, adminController.activeUserJourney)
// admin_router.post("/Userunattended/journey", auth, adminController.userUnattenedJourney)

// Host journey api
admin_router.post("/host/upcommingJourney", auth, adminController.hostUpcommingJourney)
admin_router.post("/hostMonth/wiseJourney", auth, adminController.hostMonthWiseJourney)
admin_router.post("/active/hostJourney", auth, adminController.activeHostJourney)
admin_router.post("/unattended/hostJourney", auth, adminController.unattenedHostJourney)

// Admin upload villa image
admin_router.post("/villa/image", upload.single("image"), adminController.upload);
// Mix create and update
admin_router.post("/villa/update", auth, upload.array("image"), adminController.updateVilla);
admin_router.post("/delete/villa", auth, adminController.deleteVilla)
admin_router.get("/villa/data", auth, adminController.findVilla)

// Admin can post villa colour
admin_router.post("/villaColour", auth, adminController.villaColour)
// create and update
admin_router.post("/update/colour", auth, adminController.updateVillaColour)
admin_router.post("/delete/colour", auth, adminController.deleteColour)
admin_router.get("/colour/data", auth, adminController.findColour)

admin_router.post("/free/host", auth, adminController.findFreehost)
admin_router.post("/free/basehost", adminController.SearchFreeHost)
admin_router.post("/send/mail", auth, adminController.adminSendmail)

admin_router.get("/formsubmissin/list", auth, adminController.userformsubmissionList)
admin_router.post("/particular/journey", auth, adminController.particularJourney)


admin_router.get("/colour/image", adminController.colourImage)


//Test
admin_router.post("/SendTestMail", adminController.AdminSendTestMail);
admin_router.post("/deleteTempUser", adminController.DeleteTempMail)
module.exports = admin_router;

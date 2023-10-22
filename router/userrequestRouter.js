const express = require("express");
const multer = require('multer');
const userrequestController = require("../controller/userrequestController");
const hostController = require("../controller/hostController");
const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
const { body } = require('express-validator');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config()
const router = express.Router();


router.post("/user/schedule", [body('email').isEmail().withMessage('Invalid email')], userrequestController.sendRequest)
router.post("/isActive/update", userrequestController.update_isActive)

// Self journey create by token
router.post("/self/journey", auth, userrequestController.createSelfJourney)

router.post("/forgot/password", hostController.forgotPassword)
router.get("/reset/password", hostController.resetPassword)
router.post("/reset/password", hostController.updatePassword) //pending

router.post("/save/villa/time", auth, userrequestController.saveJourneyTime)


// update not attended
router.post("/updateNotattended",auth, userrequestController.update_notAttended)


// Update finished journey
router.post("/update/finished",auth, userrequestController.updateFinished)


module.exports = router;

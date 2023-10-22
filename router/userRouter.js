const express = require("express");
const multer = require('multer');
const userController = require("../controller/userController");
const bodyParser = require("body-parser");
const auth = require("../middleware/auth")
const { body } = require('express-validator');

const user_router = express.Router();

user_router.post("/signUp", [body('email').isEmail().withMessage('Invalid email')], userController.userSignup)
user_router.post("/login", userController.userLogin)
user_router.post("/login/journeyCode", userController.loginWithEmailJourneyCode)

// user_router.get("/verify/email", userController.verifyEmail);
user_router.post("/start/journey", auth, userController.userJourney)

user_router.post("/checkDisposable", userController.checkemail)

user_router.post("/self/journey", userController.selfJourney)
user_router.post("/create/customize", userController.customize)
user_router.post("/form/submission", auth, userController.formsubmission)

user_router.post("/agoraToken", userController.GetAgoraToken)

// join journey API
user_router.post("/join/journey", auth, userController.joinJourney);



module.exports = user_router;

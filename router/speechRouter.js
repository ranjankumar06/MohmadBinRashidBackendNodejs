const express = require("express");
const speechController = require("../controller/speechController");
const bodyParser = require("body-parser");
const auth = require("../middleware/auth")
const router = express.Router();


router.post("/textToSpeech", speechController.speechData)

module.exports = router;

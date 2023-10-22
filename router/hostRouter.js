const express = require("express")
const hostController = require("../controller/hostController")
const bodyParser = require("body-parser");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv').config()
const host_router = express.Router()

host_router.post("/hostLogin", hostController.hostLogin)


// Host self journey
host_router.get("/upcommingJourney", auth, hostController.hostJourney)
host_router.get("/hostMonth/wiseJourney", auth, hostController.hostMonthWiseJourney)
host_router.get("/active/hostJourney", auth, hostController.activeHostJourney)
host_router.get("/userform/list", auth, hostController.userformsubmissionList)
host_router.post("/particular/journey", auth, hostController.particularJourney)

// joinHost
host_router.post("/hostJoin", hostController.hostJoin)

module.exports = host_router
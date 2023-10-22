const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secret');

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        // console.log("Authentication user>>",req.headers);
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ success: false, message: "User not authorized !" });
                throw new Error("User not authorized !");
            }
            req.user = decoded.user;
            next();
        });
        if (!token) {
            res.status(401).json({ success: false, message: "User not authorized or token is missing !" });
        }
    }
});



module.exports = validateToken;

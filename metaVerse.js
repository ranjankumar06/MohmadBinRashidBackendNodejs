const express = require("express");
var bodyParser = require("body-parser");
const adminRoutes = require("./router/adminRouter");
const userRouter = require("./router/userRouter")
const userRequest = require("./router/userrequestRouter")
const hostRouter = require("./router/hostRouter")
const speechRouter = require('./router/speechRouter')
const serve = require('express-static');
const path = require("path")
const cors = require("cors");
const hbs = require('hbs')
const views = path.resolve(__dirname, "../views");
const partialsPath = path.resolve(__dirname, "../views/partials");
const layout = path.resolve(__dirname, "../views/layouts");
var fs = require('fs')
const versionApiPath = "/api";


const app = express();
require("./config/configdb");

app.use(cors());

app.set('views', path.join(__dirname))
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(versionApiPath + "/admin", adminRoutes);
app.use(versionApiPath + "/user", userRouter);
app.use(versionApiPath + "/", userRequest);
app.use(versionApiPath + "/host", hostRouter);
app.use(versionApiPath + "/speech", speechRouter);


var htmlPath = path.join(__dirname, './public')
console.log("mail path", htmlPath, '\n')
app.use(versionApiPath + '/', express.static(htmlPath));
// app.get("/", (req, res) => {
//     // fs.readFile('./public/selectJourney.html', function (error, html) {
//     //     console.log("ERror ", error)
//     //     res.writeHeader(200, { "Content-Type": "text/html" })
//     //     res.write(html);
//     //     res.end()
//     // });


// });

app.use(versionApiPath + '/file/path', serve(path.join(__dirname, '../uploads')))

app.use(versionApiPath + '/file/audio', serve(path.join(__dirname, '../speech')))

var addressablePath = path.join(__dirname, '../Addressable')
app.use(versionApiPath + '/addressable', serve(addressablePath))
app.listen(3020, (err) => {
    if (err) console.log(err);
    else console.log("server running on 3020");
});

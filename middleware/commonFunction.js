const nodeMailer = require('nodemailer');
const config = require("../config/config");
// const hbs = require('nodemailer-express-handlebars');





let transporter = nodeMailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    requireTLS: true,
    auth: {
        user: config.emailUser,
        pass: config.emailPass,
    },
});

// transporter.use(
//     'compile',
//     hbs({
//       viewEngine: {
//         extName: '.hbs',
//         partialsDir: './views/partials',
//         layoutsDir: './views/layouts',
//         defaultLayout: 'email-template',
//       },
//       viewPath: './views',
//     })
//   );




// Reschedule session email send to user 
async function sendFirstEmail(email, html) {

    let mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Schedule session email',
        html: html
    }
    return await transporter.sendMail(mailOptions)

}

// Reschedule session email send to user 
async function sendSecondEmail(email, html) {

    let mailHost = {
        from: config.emailUser,
        to: email,
        subject: 'Schedule session email',
        html: html
    }

    return await transporter.sendMail(mailHost)

}

// Login credentials send to host or admin
async function sendTohost(email, html) {
    let mailHost = {
        from: config.emailUser,
        to: email,
        subject: 'Your login Credentials',
        html: html
    }
    return await transporter.sendMail(mailHost)
}

// Login credentials send to host or admin
async function sendToAdmin(email, html) {
    let mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Login Credentials',
        html: html
    }
    return await transporter.sendMail(mailOptions)
}


// forgotPassword
async function sendToForgotPassword(email, html) {
    const mailToAdmin = {
        from: config.emailUser,
        to: email,
        subject: 'Forgot password verification ',
        html: html,

    }
    return await transporter.sendMail(mailToAdmin)
}

//Send to user Journey slot email
async function sendToJourneySlot(email, html) {
    const mailToSlot = {
        from: config.emailUser,
        to: email,
        subject: 'Journey slot',
        html: html,

    }
    return await transporter.sendMail(mailToSlot)
}

//Form submission mail to user or admin
async function sendTouser(email, html) {
    let mailHost = {
        from: config.emailUser,
        to: email,
        subject: 'Thanks for your form submission',
        html: html
    }
    return await transporter.sendMail(mailHost)
}
async function sendAdmin(email, html) {
    let mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Thanks for your form submission',
        html: html
    }
    return await transporter.sendMail(mailOptions)
}

// send request to admin
async function sendToUser(email, html) {
    let mailHost = {
        from: config.emailUser,
        to: email,
        subject: 'Thanks for your form submission',
        html: html
    }
    return await transporter.sendMail(mailHost)
}

// send request to admin
async function sendRequestAdmin(email, html) {
    let mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Thanks for your form submission',
        html: html
    }
    return await transporter.sendMail(mailOptions)
}


// self journey email send to user or admin
async function sendSelfJourneyUser(email, html) {
    let mailHost = {
        from: config.emailUser,
        to: email,
        subject: 'Thanks for your form submission',
        html: html
    }
    return await transporter.sendMail(mailHost)
}

async function sendSelfJourneyToAdmin(email, html) {
    let mailOptions = {
        from: config.emailUser,
        to: email,
        subject: 'Thanks for your form submission',
        html: html
    }
    return await transporter.sendMail(mailOptions)
}



// send to schedule email host or user
async function sendToHostEmail(email, html) {
    let mailToHost = {
        from: config.emailUser,
        to: email,
        subject: 'Schedule session email',
        html: html
    }
    return await transporter.sendMail(mailToHost)
}
async function sendToUserEmail(email, html) {
    let mailToUser = {
        from: config.emailUser,
        to: email,
        subject: 'Schedule session email',
        html: html
    }
    return await transporter.sendMail(mailToUser)

}


module.exports = {
    sendFirstEmail,
    sendSecondEmail,
    sendTohost,
    sendToAdmin,
    sendToForgotPassword,
    sendToJourneySlot,
    sendTouser,
    sendAdmin,
    sendToUser,
    sendRequestAdmin,
    sendSelfJourneyUser,
    sendSelfJourneyToAdmin,
    sendToHostEmail,
    sendToUserEmail
}

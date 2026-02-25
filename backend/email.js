const nodemailer = require('nodemailer');

const {sendGridApiKey, sendGridFromEmail} = require('./config');


// async function createTestEmailer(){
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'glenna.stehr@ethereal.email',
//             pass: 'dpuHRmx5jUgMpFZrZk'
//         }
//     });
//     return transporter;
// }

function createEmailer(){
    console.log("Sendgrid Api key" , sendGridApiKey ? "Found": "Missing");
    console.log("From Email", sendGridFromEmail)
    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
            user: "apikey",
            pass: sendGridApiKey,
        }
    })
    return transporter;
}



async function sendOtpEmail(email, otp){

    const transporter = createEmailer();

    const info = await transporter.sendMail({
        from: sendGridFromEmail,
        to: email,
        subject: "Your email verification code",
        html:  `
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `         
    });

    console.log("Email email sent successfully to:", email);

    return info;
}

module.exports = { sendOtpEmail };
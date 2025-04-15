require('dotenv').config();
const http = require("http");
const nodemailer = require('nodemailer');

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: 'smtp.gmail.com',
    // port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    },
});

// Function to send email
async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            text,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.log(" Full error object:", error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendEmail };
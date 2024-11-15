import Notification from '../models/notification.js';

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST, 
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_EMAIL_USER,
        pass: process.env.MAILTRAP_EMAIL_PASS
    }
});
export const sendNotification = async (userId, message, courseId, userEmail) => {
    try {
        const notification = new Notification({
            userId: userId,
            message: message,
            courseId: courseId 
        });
        const mailOptions = {
            from: process.env.MAILTRAP_FROM, 
            to: process.env.MAILTRAP_TO, 
            subject: 'Notification', 
            text: message 
        };

        await transporter.sendMail(mailOptions);
        await notification.save();
        console.log(`Notification sent to user ${userId}: ${message}`);
    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

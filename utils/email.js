import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "kallanavya1111@gmail.com",
    pass: "aagd ckds yhsq cdwm"
  }
});


export const sendOTP = async (email, otp) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "kallanavya1111@gmail.com",
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };
  
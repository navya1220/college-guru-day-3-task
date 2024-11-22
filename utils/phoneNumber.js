import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; 

const client = twilio(accountSid, authToken);

export const sendOTPViaSMS = async (to, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioPhoneNumber, 
      to: to,
    });
    console.log(`OTP sent successfully: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error('Error sending OTP via SMS:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

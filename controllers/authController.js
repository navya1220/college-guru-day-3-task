import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RegisterModel from '../models/userRegister.js';
import { generateOTP, otpExpiry } from '../utils/otp.js';
import { sendOTP } from '../utils/email.js';


export const registerUser = async (req, res) => {
    const { name, email, mobileNumber, stream, level, password } = req.body;
  
    try {
      const existingUser = await RegisterModel.findOne({ $or: [{ email }, { mobileNumber }] });
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email or mobile number already exists' });
      }
      
      const otp = generateOTP();
      const otpExpires = otpExpiry();
      const newUser = new RegisterModel({ name, email, mobileNumber, stream, level, password, otp, otpExpires });
      await sendOTP(email, otp);
      await newUser.save();
      const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
      const errorMessage = error.name === 'ValidationError'
        ? Object.values(error.errors).map(err => err.message).join('. ')
        : 'Server error, please try again later';
      res.status(500).json({ message: errorMessage });
    }
  };


  export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const user = await RegisterModel.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      user.verified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
  
      res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error verifying OTP' });
    }
  };



export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await RegisterModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

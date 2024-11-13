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
      console.log(otp)
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

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await RegisterModel.findOne({ email});
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.isOtpVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    const user = await RegisterModel.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error while retrieving user profile' });
  }
};


export const updateUserProfile = async (req, res) => {
  const { name, email, mobileNumber, stream, level } = req.body;

  try {
    const user = await RegisterModel.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const emailExists = await RegisterModel.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const mobileExists = await RegisterModel.findOne({ mobileNumber });
      if (mobileExists) {
        return res.status(409).json({ message: 'Mobile number is already in use' });
      }
      user.mobileNumber = mobileNumber;
    }

    if (name) user.name = name;
    if (stream) user.stream = stream;
    if (level) user.level = level;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};



export const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

export const  forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await user.findOne({ email });
    if (!user) return res.status(404).json({ error: "User with this email does not exist." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 300000; 
    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();
    res.json({ message: "OTP generated successfully.", otp });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await user.findOne({ email, resetOtp: otp, resetOtpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: "Invalid or expired OTP." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};


export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await RegisterModel.findById(userId)
      .populate('colleges');
    const user1 = await RegisterModel.findById(userId).populate('courses');

    console.log('Before population:', user.colleges);

    console.log('After population:', user.colleges);

    if (!user || !user1.courses || !user.colleges) {
      return res.status(404).json({ message: 'No registered courses or colleges found' });
    }

    const registeredCourses = Array.isArray(user.courses) ? user1.courses : [];
    const registeredColleges = Array.isArray(user.colleges) ? user.colleges : [];

    if (registeredCourses.length === 0 && registeredColleges.length === 0) {
      return res.status(404).json({ message: 'No registered courses or colleges found' });
    }

    const response = {
      registeredCourses,
      registeredColleges,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching registered courses and colleges:', error);
    res.status(500).json({ message: 'Server error while retrieving registered preferences' });
  }
};











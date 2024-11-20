import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RegisterModel from '../models/userRegister.js';
import { otpExpiry } from '../utils/otp.js';
import { sendOTP } from '../utils/email.js';
import { sendNotification } from '../services/notificationService.js';
import otpGenerator from 'otp-generator';


export const registerUser = async (req, res) => {
  const { name, email, mobileNumber, stream, level, password } = req.body;

  try {
    const existingUser = await RegisterModel.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'mobile number';
      return res.status(409).json({ message: `User with this ${conflictField} already exists` });
    }

    const newUser = new RegisterModel({
      name,
      email,
      mobileNumber,
      stream,
      level,
      password
    });

    await newUser.save();
    const message = `Welcome ${name}! Your registration was successful.`;

    try {
      await sendNotification(newUser._id, message, null, email);
    } catch (err) {
      console.error('Notification failed:', err);
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    const errorMessage =
      error.name === 'ValidationError'
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
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });
    console.log("Generated OTP:", otp);
    user.otp = otp;
    user.otpExpires = otpExpiry();
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });  // Corrected here

    try {
      await sendOTP(user.email, otp);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }

    res.status(200).json({
      message: 'OTP sent to your email. Please verify it to complete the login process.',
      token,  
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await RegisterModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.otp = null;
    user.otpExpires = null;
    user.isOtpVerified = true;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await RegisterModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false, digits: true });
    const otpExpires = Date.now() + 300000; 

    user.resetOtp = otp;
    user.resetOtpExpires = otpExpires;
    await user.save();

    await sendOTP(email, otp);

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error during forgot password:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
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


export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await RegisterModel.findOne({ email, resetOtp: otp, resetOtpExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const userId1 = req.user._id;
    console.log(userId1);
    console.log(userId);
    const user = await RegisterModel.findById(userId)
      .populate({ path: 'colleges', model: 'College' })
      .populate('courses');

    if (!user || (!user.courses.length && !user.colleges.length)) {
      return res.status(404).json({ message: 'No registered courses or colleges found' });
    }

    const registeredCourses = user.courses || [];
    const registeredColleges = user.colleges || [];

    res.status(200).json({ registeredCourses, registeredColleges });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error while retrieving preferences' });
  }
};



export const updateUserPreferences = async (req, res) => {
  const userId = req.user._id; 
  const { courses, colleges } = req.body;

  try {
    if (!Array.isArray(courses) || !Array.isArray(colleges)) {
      return res.status(400).json({ message: 'Courses and colleges should be arrays of IDs' });
    }
    const updatedUser = await RegisterModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          courses: courses,
          colleges: colleges,
        },
      },
      { new: true }
    )
      .populate({ path: 'colleges', model: 'College' })
      .populate('courses');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updatedCourses = updatedUser.courses || [];
    const updatedColleges = updatedUser.colleges || [];

    res.status(200).json({ message: 'Preferences updated successfully', updatedCourses, updatedColleges });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

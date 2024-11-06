import RegisterModel from '../models/userRegister.js';

export const registerUser = async (req, res) => {
  const { name, email, mobileNumber, stream, level, password } = req.body;
  
  try {
    const existingUser = await RegisterModel.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or mobile number already exists' });
    }

    const newUser = new RegisterModel({ name, email, mobileNumber, stream, level, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    const errorMessage = error.name === 'ValidationError' 
      ? Object.values(error.errors).map(err => err.message).join('. ')
      : 'Server error, please try again later';
    res.status(500).json({ message: errorMessage });
  }
};

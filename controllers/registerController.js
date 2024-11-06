import RegisterModel from "../models/userRegister.js";

export const RegisterUser = async (req, res) => {
    try {
        const { name, email, mobileNumber, stream, level, password } = req.body;
        const existingUser = await RegisterModel.findOne({
            $or: [{ email }, { mobileNumber }]
        });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email or mobile number' });
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
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};


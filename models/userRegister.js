import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const RegisterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: { type: Number, required: true, unique: true },
    stream: {
        type: String,
        enum: ['Design', 'Engineering', 'Medical', 'Science', 'Others', 'Pharmacy', 'Agriculture', 'Management'],
        required: true,
    },
    level: {
        type: String,
        enum: ['PG', 'UG', 'Diploma', 'Ph.D', 'Certificate'],
        required: true,
    },
    password: { type: String, required: true },
});

RegisterSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const RegisterModel = mongoose.model("Register", RegisterSchema);

export default RegisterModel;

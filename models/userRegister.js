import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const RegisterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email format!`
    }
  },
  mobileNumber: {
    type: Number,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\+?[1-9]\d{1,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
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
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  otp: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[\d\w]{4,6}$/.test(v); 
      },
      message: props => `${props.value} is not a valid OTP format!`
    }
  },
  otpExpires: {
    type: Date,
    default: Date.now,
    expires: 300, 
  },
  isOtpVerified: {
    type: Boolean,
    default: false
  },
  resetOtp: { 
    type: String 
  },
  resetOtpExpires: { 
    type: Date 
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
});

RegisterSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const RegisterModel = mongoose.model('Register', RegisterSchema);
export default RegisterModel;

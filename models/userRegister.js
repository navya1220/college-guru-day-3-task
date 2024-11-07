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
        return /^\d{10}$/.test(v);
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
    validate: {
      validator: function (v) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return regex.test(v);
      },
      message: 'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.'
    }
  },

 /* otp: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{4,6}$/.test(v);
      },
      message: props => `${props.value} is not a valid OTP format!`
    }
  },

  otpExpires: {
    type: Date,
    default: Date.now,
    expires: 300 
  },

  isOtpVerified: {
    type: Boolean,
    default: false
  } */
});

RegisterSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const RegisterModel = mongoose.model('Register', RegisterSchema);

export default RegisterModel;

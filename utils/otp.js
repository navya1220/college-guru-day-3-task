

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
export const otpExpiry = () => Date.now() + 10 * 60 * 1000; 

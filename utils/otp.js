
export const otpExpiry = () => {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); 
    return expiryTime;
  };
  
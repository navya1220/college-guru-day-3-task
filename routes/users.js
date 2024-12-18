import express from 'express';
import { registerUser, loginWithEmail, loginWithEmailAndPassword, getUserProfile, updateUserProfile, verifyOTP, logoutUser , getUserPreferences, forgotPassword, resetPassword} from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login-email', loginWithEmail);
router.post('/login-email-password', loginWithEmailAndPassword);
router.post('/verifyOTP',authenticateJWT, verifyOTP);
router.get('/profile', authenticateJWT, getUserProfile);
router.put('/profile', authenticateJWT, updateUserProfile);
router.post('/logout', authenticateJWT, logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/preferences', authenticateJWT, getUserPreferences);



export default router;

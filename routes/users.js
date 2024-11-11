import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, verifyOTP, logoutUser , getUserPreferences, updateUserPreferences, forgotPassword, resetPassword} from '../controllers/authController.js';
import { addReview, getReviews } from '../controllers/collegeReviews.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verifyOTP', verifyOTP);
router.get('/profile', authenticateJWT, getUserProfile);
router.put('/profile', authenticateJWT, updateUserProfile);
router.post('/logout', authenticateJWT, logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/preferences', authenticateJWT, getUserPreferences);
router.put('/preferences', authenticateJWT, updateUserPreferences);
router.post("/colleges/:id/reviews", authenticateJWT, addReview);
router.get("/colleges/:id/reviews", getReviews);


export default router;

import express from 'express';
import { registerUser, loginUser, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/verifyOTP', verifyOTP);

export default router;

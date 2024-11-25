import express from 'express';
import { createCourse } from '../controllers/coursesController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
const router = express.Router();


router.post("/", authenticateJWT,  createCourse);

export default router;



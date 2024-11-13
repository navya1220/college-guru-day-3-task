import express from 'express';
import { createCollege, addReview, getReviews } from '../controllers/collegeController.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';
const router = express.Router();


router.post("/", authenticateJWT,  createCollege);
router.post("/:id/reviews", authenticateJWT, addReview);
router.get("/:id/reviews", getReviews);

export default router;
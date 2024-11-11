import Review from '../models/review.js';
import College from '../models/college.js';


export const addReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
  
    try {
      const college = await College.findById(id);
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
  
      const existingReview = await Review.findOne({ user: userId, college: id });
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this college" });
      }
  
      const review = new Review({
        user: userId,
        college: id,
        rating,
        comment,
      });
  
      await review.save();
      res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  
  export const getReviews = async (req, res) => {
    const { id } = req.params;
  
    try {
      const college = await College.findById(id);
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
      const reviews = await Review.find({ college: id })
        .populate("user", "name")
        .sort({ createdAt: -1 });
  
      res.status(200).json({ reviews });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
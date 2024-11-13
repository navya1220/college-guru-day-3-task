import Review from '../models/review.js';
import CollegeModel from '../models/colleges.js';
import RegisterModel from '../models/userRegister.js';


export const createCollege = async (req, res) => {
  const {
    name, location, degrees, coursesOffered, yearOfEstablishment, type, feesRange, highestPackage, popularity, ratings, admissionDetails, scholarships, gallery,
  } = req.body;

  try {
    console.log('User from token:', req.user);
    const user = await RegisterModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newCollege = new CollegeModel({
      name,
      location,
      degrees,
      coursesOffered,
      yearOfEstablishment,
      type,
      feesRange,
      highestPackage,
      popularity,
      ratings,
      admissionDetails,
      scholarships,
      gallery,
      createdBy: user._id,
    });

    await newCollege.save();
    const updatedUser = await RegisterModel.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { colleges: newCollege._id } }, 
      { new: true, runValidators: false }
    );

    if (!updatedUser.colleges.includes(newCollege._id)) {
      return res.status(400).json({ message: 'Failed to add college to user preferences' });
    }

    res.status(201).json({ message: 'College added successfully', college: newCollege });
  } catch (error) {
    console.error('Error in createCollege:', error);

    if (error.code === 11000) {
      res.status(400).json({ message: 'College with this name already exists' });
    } else {
      res.status(500).json({ message: `Server error while adding college: ${error.message}` });
    }
  }
};



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
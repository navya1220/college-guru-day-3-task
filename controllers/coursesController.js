import RegisterModel from "../models/userRegister.js";
import CourseModel from "../models/courses.js";

export const createCourse = async (req, res) => {
  const {
    title,
    description,
    duration,
    minimumEligibility,
    entranceExams,
    admissionProcess,
    averageFee,
    college,
  } = req.body;

  try {
    console.log('User from token:', req.user);

    const user = await RegisterModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newCourse = new CourseModel({
      title,
      description,
      duration,
      minimumEligibility,
      entranceExams,
      admissionProcess,
      averageFee,
      college,
      createdBy: user._id,
    });

    await newCourse.save();

    await RegisterModel.findByIdAndUpdate(
      req.user._id,
      { $push: { courses: newCourse._id } },
      { new: true, runValidators: false }
    );

    res.status(201).json({ message: 'Course added successfully', course: newCourse });
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({ message: `Server error while adding course: ${error.message}` });
  }
};



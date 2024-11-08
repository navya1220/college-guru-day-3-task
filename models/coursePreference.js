import mongoose from 'mongoose'; 

const CoursePreferenceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    savedCourses: [String], 
    savedColleges: [String] 
  });
  
  const PreferenceModel = mongoose.model('CoursePreference', CoursePreferenceSchema);

export default PreferenceModel;
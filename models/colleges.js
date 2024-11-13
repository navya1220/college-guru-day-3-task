import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  degrees: {
    type: [String],
    enum: ['BTech', 'Diploma', 'MTech', 'Doctorate', 'Ph.D', 'Certificate', 'Law', 'UG', 'PG'],
    required: true,
  },
  coursesOffered: [String],
  yearOfEstablishment: Number,
  type: String,
  feesRange: {
    min: Number,
    max: Number,
  },
  highestPackage: String,
  popularity: String,
  ratings: Number,
  admissionDetails: {
    ugCourses: String,
    pgCourses: String,
    phdCourses: String,
    admissionTestDates: String,
    applicationDeadline: String,
  },
  scholarships: Boolean,
  gallery: [
    {
      url: String,
      description: String,
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
  
},
{ timestamps: true }
);

const CollegeModel = mongoose.model('College', CollegeSchema);
export default CollegeModel;

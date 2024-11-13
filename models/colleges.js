import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
    },
    location: {
      type: String,
      required: true,
    },
    degrees: [
      {
        type: String,
        enum: ["BTech", "MTech", "BArch", "Diploma", "Doctorate"],
      },
    ],
    coursesOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', 
      },
    ],
    yearOfEstablishment: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Public", "Private"],
      required: true,
    },
    feesRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    highestPackage: {
      type: String,
    },
    popularity: {
      type: String,
      enum: ["Popular", "Standard", "New"],
      default: "Standard",
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    admissionDetails: {
      ugCourses: String,
      pgCourses: String,
      phdCourses: String,
      admissionTestDates: String,
      applicationDeadline: String,
    },
    scholarships: {
      type: Boolean,
      default: false,
    },
    gallery: [
      {
        url: String,
        description: String,
      },
    ],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Register" },
        reviewText: String,
        rating: { type: Number, min: 0, max: 5 },
        flagged: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true }, 
  },
  {
    timestamps: true,
  }
);

collegeSchema.virtual('averageRating').get(function () {
  if (this.ratings.length === 0) return null;
  const sum = this.ratings.reduce((a, b) => a + b, 0);
  return sum / this.ratings.length;
});

collegeSchema.set('toJSON', { virtuals: true });
collegeSchema.set('toObject', { virtuals: true });

const CollegeModel = mongoose.model("College", collegeSchema);
export default CollegeModel;

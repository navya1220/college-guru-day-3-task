import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String },
});

const College = mongoose.model("College", collegeSchema);
export default College;

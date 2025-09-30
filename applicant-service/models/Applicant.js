const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: false },
  skills: [{ type: String, required: true }],
  experience: { type: Number, required: true },
  appliedFor: { type: String, required: true }, // jobId
  jobSnapshot: { type: Object }, // optional cached snapshot of JD
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Rejected'],
    default: 'Applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);

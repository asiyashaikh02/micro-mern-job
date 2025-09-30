const Applicant = require('../models/Applicant');
const axios = require('axios');

const JOB_SERVICE_URL = process.env.JOB_SERVICE_URL || 'http://job-service:3001';

exports.createApplicant = async (req, res, next) => {
  try {
    const payload = req.body;
    // optional: fetch job snapshot at apply-time
    try {
      const r = await axios.get(`${JOB_SERVICE_URL}/api/jds/${payload.appliedFor}`);
      payload.jobSnapshot = { title: r.data.title, minExperience: r.data.minExperience, skillsRequired: r.data.skillsRequired };
    } catch (e) { /* continue without snapshot */ }

    const applicant = await Applicant.create(payload);
    res.status(201).json(applicant);
  } catch (err) { next(err); }
};

exports.getAllApplicants = async (req, res, next) => {
  try {
    const applicants = await Applicant.find();
    if (req.query.includeJob === 'true') {
      const results = await Promise.all(applicants.map(async a => {
        let jd = null;
        try {
          const r = await axios.get(`${JOB_SERVICE_URL}/api/jds/${a.appliedFor}`);
          jd = r.data;
        } catch (e) { /* ignore */ }
        return { ...a.toObject(), job: jd };
      }));
      return res.json(results);
    }
    res.json(applicants);
  } catch (err) { next(err); }
};

exports.getApplicantById = async (req, res, next) => {
  try {
    const applicant = await Applicant.findById(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    if (req.query.includeJob === 'true') {
      try {
        const r = await axios.get(`${JOB_SERVICE_URL}/api/jds/${applicant.appliedFor}`);
        return res.json({ ...applicant.toObject(), job: r.data });
      } catch (e) { /* fallthrough */ }
    }
    res.json(applicant);
  } catch (err) { next(err); }
};

exports.shortlistByJD = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const r = await axios.get(`${JOB_SERVICE_URL}/api/jds/${jobId}`);
    const jd = r.data;
    if (!jd) return res.status(404).json({ message: 'JD not found' });

    const applicants = await Applicant.find({ appliedFor: jobId });
    const results = [];

    for (let applicant of applicants) {
      const hasSkills = jd.skillsRequired.every(skill => applicant.skills.includes(skill));
      const hasExperience = applicant.experience >= jd.minExperience;
      applicant.status = (hasSkills && hasExperience) ? 'Shortlisted' : 'Rejected';
      await applicant.save();
      results.push(applicant);
    }

    res.json({ message: 'Shortlisting done', count: results.length, results });
  } catch (err) { next(err); }
};

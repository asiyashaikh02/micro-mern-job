const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicantController');

router.post('/', ctrl.createApplicant);
router.get('/', ctrl.getAllApplicants);
router.get('/:id', ctrl.getApplicantById);
router.put('/:id', async (req, res) => res.status(501).json({msg: 'not implemented'}));
router.delete('/:id', async (req, res) => res.status(501).json({msg: 'not implemented'}));

// special: shortlist applicants for a given JD
router.post('/shortlist/:jobId', ctrl.shortlistByJD);

module.exports = router;

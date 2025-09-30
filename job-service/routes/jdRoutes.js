const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/jdController');

router.post('/', ctrl.createJD);
router.get('/', ctrl.getAllJDs);
router.get('/:id', ctrl.getJDById);
router.put('/:id', ctrl.updateJD);
router.delete('/:id', ctrl.deleteJD);

module.exports = router;

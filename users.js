const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Student = require('../models/Student');
const College = require('../models/College');

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, academicProfile } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { name, academicProfile },
      { new: true, runValidators: true }
    ).populate('savedColleges', 'name location type averageFees logo');
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── POST /api/users/save-college/:collegeId ──────────────────────────────────
router.post('/save-college/:collegeId', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    const cid = req.params.collegeId;
    const isSaved = student.savedColleges.includes(cid);

    if (isSaved) {
      student.savedColleges.pull(cid);
    } else {
      student.savedColleges.push(cid);
    }
    await student.save({ validateBeforeSave: false });
    res.json({ success: true, saved: !isSaved, data: student.savedColleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/users/application ─────────────────────────────────────────────
router.post('/application', protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { $push: { applicationTrack: req.body } },
      { new: true }
    ).populate('applicationTrack.college', 'name logo location');
    res.status(201).json({ success: true, data: student.applicationTrack });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/users/application/:appId ─────────────────────────────────────
router.patch('/application/:appId', protect, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.user.id, 'applicationTrack._id': req.params.appId },
      { $set: { 'applicationTrack.$': { ...req.body, _id: req.params.appId } } },
      { new: true }
    );
    res.json({ success: true, data: student.applicationTrack });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('savedColleges', 'name location type rankings averageFees overallRating logo')
      .populate('applicationTrack.college', 'name logo location type');
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

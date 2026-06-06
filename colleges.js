const express = require('express');
const router = express.Router();
const College = require('../models/College');
const protect = require('../middleware/auth');
const { semanticSearchColleges, generateCollegeSummary } = require('../services/geminiService');

// ─── GET /api/colleges ────────────────────────────────────────────────────────
// Regular filter-based listing (always works without Gemini)
router.get('/', async (req, res) => {
  try {
    const {
      search, state, type, tier, minFees, maxFees, exam,
      page = 1, limit = 12, sort = '-aiRatingScore',
    } = req.query;

    const query = { isActive: true };

    if (search) {
      // Use MongoDB text search (regex fallback for non-indexed fields)
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }
    if (state) query['location.state'] = { $in: state.split(',') };
    if (type) query.type = { $in: type.split(',') };
    if (tier) query.tier = { $in: tier.split(',') };
    if (minFees || maxFees) {
      query.averageFees = {};
      if (minFees) query.averageFees.$gte = Number(minFees);
      if (maxFees) query.averageFees.$lte = Number(maxFees);
    }
    if (exam) query.entranceExams = { $in: exam.split(',') };

    const skip = (Number(page) - 1) * Number(limit);
    const [colleges, total] = await Promise.all([
      College.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('-featureVector'),
      College.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: colleges.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: colleges,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/colleges/ai-search ─────────────────────────────────────────────
// Gemini-powered semantic search
router.get('/ai-search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    // Get all colleges for Gemini to rank
    const allColleges = await College.find({ isActive: true })
      .select('_id name type tier location averageFees rankings placementData courses')
      .lean();

    let resultColleges = [];

    try {
      const rankedIds = await semanticSearchColleges(q, allColleges);
      if (rankedIds.length > 0) {
        // Map IDs back to college objects in ranked order
        const collegeMap = new Map(allColleges.map(c => [c._id.toString(), c]));
        resultColleges = rankedIds
          .map(id => collegeMap.get(id.toString()))
          .filter(Boolean);
      }
    } catch (geminiErr) {
      console.warn('Gemini search failed, falling back to regex:', geminiErr.message);
      // Fallback: simple regex search
      resultColleges = allColleges.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.location?.state?.toLowerCase().includes(q.toLowerCase()) ||
        c.type?.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Fetch full college data for results
    const fullColleges = await College.find({
      _id: { $in: resultColleges.map(c => c._id) }
    }).select('-featureVector');

    // Maintain Gemini's ranking order
    const idOrder = resultColleges.map(c => c._id.toString());
    const sorted = [...fullColleges].sort((a, b) =>
      idOrder.indexOf(a._id.toString()) - idOrder.indexOf(b._id.toString())
    );

    res.json({
      success: true,
      count: sorted.length,
      query: q,
      aiPowered: true,
      data: sorted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/colleges/stats/overview ────────────────────────────────────────
router.get('/stats/overview', async (req, res) => {
  try {
    const [stats, byType] = await Promise.all([
      College.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalColleges: { $sum: 1 }, avgFees: { $avg: '$averageFees' }, avgRating: { $avg: '$overallRating' }, totalReviews: { $sum: '$reviewCount' } } },
      ]),
      College.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);
    res.json({ success: true, data: { summary: stats[0], byType } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/colleges/:slugOrId ──────────────────────────────────────────────
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    // Avoid matching 'ai-search' or 'stats' as a slug
    if (['ai-search', 'stats'].includes(slugOrId)) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    
    const isId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const college = isId
      ? await College.findById(slugOrId).select('-featureVector')
      : await College.findOne({ slug: slugOrId }).select('-featureVector');

    if (!college) return res.status(404).json({ success: false, message: 'College not found' });

    // Generate AI summary if not present (async, don't block the response)
    if (!college.aiSummary && process.env.GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE') {
      generateCollegeSummary(college).then(summary => {
        College.findByIdAndUpdate(college._id, { aiSummary: summary }).catch(() => {});
      }).catch(() => {});
    }

    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/colleges (Admin only) ─────────────────────────────────────────
const { adminOnly } = require('../middleware/auth');
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const college = await College.create(req.body);
    res.status(201).json({ success: true, data: college });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/colleges/:id (Admin only) ──────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!college) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, data: college });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

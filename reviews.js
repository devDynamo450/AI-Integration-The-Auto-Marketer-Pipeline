const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const College = require('../models/College');
const protect = require('../middleware/auth');
const { analyzeReviewSentiment } = require('../services/geminiService');

// ─── GET /api/reviews/college/:collegeId ──────────────────────────────────────
router.get('/college/:collegeId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { college: req.params.collegeId, isApproved: true };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('author', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: reviews.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/reviews ────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { college: collegeId, ...reviewData } = req.body;
    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'College ID is required' });
    }

    // Check college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    // Check duplicate
    const existing = await Review.findOne({ college: collegeId, author: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this college' });
    }

    const review = await Review.create({
      college: collegeId,
      author: req.user.id,
      ...reviewData,
    });

    // Trigger async Gemini sentiment analysis (fire and forget)
    analyzeSentimentAsync(review._id, review, collegeId);

    res.status(201).json({ success: true, data: review, message: 'Review submitted and is being analyzed by AI' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this college' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Gemini Sentiment Analysis (async, does not block response) ───────────────
async function analyzeSentimentAsync(reviewId, review, collegeId) {
  try {
    const text = [review.title, review.pros, review.cons, review.body]
      .filter(Boolean).join(' ');

    if (!text.trim()) {
      await Review.findByIdAndUpdate(reviewId, { sentimentLabel: 'genuine', isApproved: true });
      await updateCollegeSentiment(collegeId);
      return;
    }

    const geminiEnabled = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE';

    let result;
    if (geminiEnabled) {
      result = await analyzeReviewSentiment(text);
    } else {
      // Simple rule-based fallback
      result = simpleRuleBasedSentiment(text);
    }

    const isApproved = !['suspicious', 'promotional'].includes(result.label);

    await Review.findByIdAndUpdate(reviewId, {
      sentimentLabel: result.label,
      sentimentScore: result.score,
      sentimentConfidence: result.confidence,
      aiSummary: result.reasoning || null,
      isApproved,
    });

    await updateCollegeSentiment(collegeId);
    console.log(`✅ Sentiment analysis complete for review ${reviewId}: ${result.label}`);
  } catch (err) {
    console.warn(`⚠️ Sentiment analysis failed for review ${reviewId}:`, err.message);
    // Default: approve the review
    await Review.findByIdAndUpdate(reviewId, { sentimentLabel: 'genuine', isApproved: true }).catch(() => {});
    await updateCollegeSentiment(collegeId).catch(() => {});
  }
}

function simpleRuleBasedSentiment(text) {
  const lower = text.toLowerCase();
  const promoWords = ['best college', 'world class', '100% placement', 'guaranteed', 'no complaints', 'perfect'];
  const negWords = ['worst', 'scam', 'fraud', 'avoid', 'waste', 'terrible'];
  const promoCount = promoWords.filter(w => lower.includes(w)).length;
  const negCount = negWords.filter(w => lower.includes(w)).length;
  if (promoCount >= 2) return { label: 'promotional', score: 0.7, confidence: 0.6, reasoning: 'Overly positive language detected' };
  if (negCount >= 2) return { label: 'negative', score: -0.6, confidence: 0.7, reasoning: 'Multiple negative indicators' };
  return { label: 'genuine', score: 0.3, confidence: 0.5, reasoning: 'Appears genuine' };
}

async function updateCollegeSentiment(collegeId) {
  const agg = await Review.aggregate([
    { $match: { college: new (require('mongoose').Types.ObjectId)(collegeId), isApproved: true } },
    { $group: { _id: null, avgSentiment: { $avg: '$sentimentScore' }, avgOverall: { $avg: '$ratings.overall' }, count: { $sum: 1 } } },
  ]);
  if (agg.length > 0) {
    await College.findByIdAndUpdate(collegeId, {
      sentimentScore: agg[0].avgSentiment || 0,
      overallRating: agg[0].avgOverall || 0,
      reviewCount: agg[0].count,
    });
  }
}

// ─── PATCH /api/reviews/:id/helpful ──────────────────────────────────────────
router.patch('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/reviews/my-reviews ─────────────────────────────────────────────
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ author: req.user.id })
      .populate('college', 'name slug logo')
      .sort('-createdAt');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

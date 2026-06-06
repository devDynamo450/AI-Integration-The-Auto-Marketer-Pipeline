const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    batch: { type: Number },
    course: { type: String },
    ratings: {
      academics: { type: Number, min: 1, max: 5 },
      placements: { type: Number, min: 1, max: 5 },
      infrastructure: { type: Number, min: 1, max: 5 },
      faculty: { type: Number, min: 1, max: 5 },
      hostel: { type: Number, min: 1, max: 5 },
      campusLife: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5, required: true },
    },
    title: { type: String, maxlength: 150 },
    pros: { type: String, maxlength: 1000 },
    cons: { type: String, maxlength: 1000 },
    body: { type: String, maxlength: 3000 },
    // ─── AI Sentiment Analysis Fields ─────────────────────────────────────────
    sentimentLabel: {
      type: String,
      enum: ['genuine', 'promotional', 'suspicious', 'negative', 'mixed', 'pending'],
      default: 'pending',
    },
    sentimentScore: { type: Number, min: -1, max: 1, default: null },
    sentimentConfidence: { type: Number, min: 0, max: 1, default: null },
    aiSummary: { type: String },          // AI-generated pros/cons summary
    // ─── Moderation ───────────────────────────────────────────────────────────
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

// One review per student per college
reviewSchema.index({ college: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

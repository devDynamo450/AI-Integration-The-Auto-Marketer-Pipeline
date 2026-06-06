const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  year: { type: Number },
  averagePackage: { type: Number },   // in LPA
  highestPackage: { type: Number },   // in LPA
  placementRate: { type: Number },    // percentage
  topRecruiters: [{ type: String }],
  totalOffers: { type: Number },
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number },   // years
  seats: { type: Number },
  fees: { type: Number },       // per year in INR
  mode: { type: String, enum: ['Regular', 'Distance', 'Online'], default: 'Regular' },
});

const cutoffSchema = new mongoose.Schema({
  exam: { type: String },       // JEE, NEET, CAT, etc.
  category: { type: String },   // General, OBC, SC, ST
  year: { type: Number },
  rank: { type: Number },
  score: { type: Number },
});

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, lowercase: true },
    shortName: { type: String },
    type: {
      type: String,
      enum: ['IIT', 'NIT', 'IIIT', 'Central University', 'State University', 'Private', 'Deemed', 'Other'],
      required: true,
    },
    tier: { type: String, enum: ['Tier 1', 'Tier 2', 'Tier 3'], default: 'Tier 2' },
    location: {
      city: { type: String },
      state: { type: String, index: true },
      pincode: { type: String },
      address: { type: String },
      coordinates: { type: [Number] },   // [longitude, latitude] - optional
    },
    courses: [courseSchema],
    rankings: {
      nirf: { type: Number },
      qs: { type: Number },
      outlook: { type: Number },
      theWeek: { type: Number },
      indiaToday: { type: Number },
    },
    averageFees: { type: Number, index: true },   // per year, INR
    totalFees: { type: Number },                   // full course, INR
    entranceExams: [{ type: String }],
    cutoffs: [cutoffSchema],
    placementData: [placementSchema],
    facilities: [{ type: String }],
    accreditation: { type: String },              // NAAC A++, A+, A, etc.
    approvedBy: [{ type: String }],               // UGC, AICTE, MCI, etc.
    establishedYear: { type: Number },
    website: { type: String },
    email: { type: String },
    phone: { type: String },
    images: [{ type: String }],
    logo: { type: String },
    // ─── AI-Computed Fields ────────────────────────────────────────────────
    aiRatingScore: { type: Number, default: 0, min: 0, max: 100 },
    sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
    overallRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    aiSummary: { type: String, default: null },   // Gemini-generated summary
    // ─── Feature Vector for ML ────────────────────────────────────────────
    featureVector: { type: [Number], select: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index for search
collegeSchema.index({ name: 'text', 'location.city': 'text', 'location.state': 'text' });

// Auto-generate slug from name - Mongoose 9 compatible
collegeSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('College', collegeSchema);

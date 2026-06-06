const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const academicProfileSchema = new mongoose.Schema({
  percentage12th: { type: Number, min: 0, max: 100 },
  percentageMath: { type: Number, min: 0, max: 100 },
  percentageScience: { type: Number, min: 0, max: 100 },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'IB', 'Other'], default: 'CBSE' },
  jeeRank: { type: Number },
  neetScore: { type: Number },
  preferredCourses: [{ type: String }],
  budgetMin: { type: Number, default: 0 },
  budgetMax: { type: Number, default: 2000000 },
  preferredStates: [{ type: String }],
  preferredCollegeType: {
    type: String,
    enum: ['Government', 'Private', 'Deemed', 'Any'],
    default: 'Any',
  },
  careerGoal: { type: String },
});

const applicationTrackSchema = new mongoose.Schema({
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  course: { type: String },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ['planning', 'applied', 'accepted', 'rejected', 'waitlisted'],
    default: 'planning',
  },
  notes: { type: String },
  addedAt: { type: Date, default: Date.now },
});

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatar: { type: String, default: null },
    academicProfile: { type: academicProfileSchema, default: {} },
    savedColleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],
    applicationTrack: [applicationTrackSchema],
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
// In Mongoose 9, async pre-save middleware does NOT call next() — just return/throw
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);

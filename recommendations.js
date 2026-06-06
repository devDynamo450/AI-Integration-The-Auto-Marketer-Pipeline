const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const College = require('../models/College');
const { chatWithCounselor, explainRecommendation } = require('../services/geminiService');

// ─── Content-based scoring (no Python dependency) ────────────────────────────
function computeMatchScore(profile, college) {
  let score = 0;
  const reasons = [];

  // Budget (30pts)
  const fees = college.averageFees || 0;
  const budget = profile.budgetMax || 1000000;
  if (fees <= budget) {
    const ratio = fees / budget;
    score += Math.max(0, (1 - ratio)) * 30;
    if (fees <= budget * 0.5) reasons.push('Well within your budget');
    else reasons.push('Fits your budget');
  }

  // Location (20pts)
  const state = college.location?.state || '';
  if (profile.preferredStates?.length) {
    if (profile.preferredStates.includes(state)) { score += 20; reasons.push(`In preferred state (${state})`); }
    else score += 5;
  } else { score += 15; }

  // College type (15pts)
  const govTypes = ['IIT', 'NIT', 'IIIT', 'Central University', 'State University'];
  if (profile.preferredCollegeType === 'Any') { score += 15; }
  else if (profile.preferredCollegeType === 'Government' && govTypes.includes(college.type)) { score += 15; reasons.push('Government institution'); }
  else if (profile.preferredCollegeType === 'Private' && college.type === 'Private') { score += 15; reasons.push('Private institution'); }
  else if (profile.preferredCollegeType === 'Deemed' && college.type === 'Deemed') { score += 15; }
  else { score += 5; }

  // Academic fit (20pts)
  const pct = profile.percentage12th || 70;
  const tierThresh = { 'Tier 1': 85, 'Tier 2': 70, 'Tier 3': 50 };
  const thresh = tierThresh[college.tier] || 60;
  if (pct >= thresh) {
    score += Math.min(20, 20 * (pct - thresh + 10) / 30);
    reasons.push('Matches your academic profile');
  } else if (pct >= thresh - 10) {
    score += 8;
  }

  // Course availability (10pts)
  const coursesOffered = (college.courses || []).map(c => c.name?.toLowerCase());
  const preferred = (profile.preferredCourses || []).map(c => c.toLowerCase());
  if (preferred.length) {
    const matched = preferred.filter(p => coursesOffered.some(c => c.includes(p) || p.includes(c.split(' ')[0])));
    if (matched.length) { score += 10; reasons.push(`Offers: ${matched[0]}`); }
  } else { score += 7; }

  // JEE rank (5pts)
  if (profile.jeeRank && (college.entranceExams || []).some(e => e.includes('JEE'))) {
    const nirf = college.rankings?.nirf || 999;
    const expectedRank = Math.max(100, nirf * 500);
    if (profile.jeeRank <= expectedRank) { score += 5; }
  }

  return {
    score: Math.round(Math.min(100, Math.max(25, score))),
    reasons: reasons.slice(0, 3),
  };
}

// ─── POST /api/recommendations ────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const profile = {
      percentage12th: req.body.percentage12th ?? req.user.academicProfile?.percentage12th ?? 70,
      preferredCourses: req.body.preferredCourses ?? req.user.academicProfile?.preferredCourses ?? [],
      budgetMax: req.body.budgetMax ?? req.user.academicProfile?.budgetMax ?? 1000000,
      preferredStates: req.body.preferredStates ?? req.user.academicProfile?.preferredStates ?? [],
      preferredCollegeType: req.body.preferredCollegeType ?? req.user.academicProfile?.preferredCollegeType ?? 'Any',
      jeeRank: req.body.jeeRank ? Number(req.body.jeeRank) : null,
    };

    const colleges = await College.find({ isActive: true })
      .select('_id name shortName slug type tier location averageFees entranceExams rankings placementData courses accreditation overallRating reviewCount')
      .lean();

    // Score all colleges
    const scored = colleges
      .map(c => ({ college: c, ...computeMatchScore(profile, c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    // Enrich top 3 with Gemini reasoning (fire-and-forget for rest)
    const geminiEnabled = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE';

    const enriched = await Promise.all(
      scored.map(async ({ college, score, reasons }, i) => {
        let matchReasons = reasons;
        if (geminiEnabled && i < 5) {
          try {
            const geminiReasons = await explainRecommendation(profile, college, score);
            if (geminiReasons.length > 0) matchReasons = geminiReasons;
          } catch {
            // keep fallback reasons
          }
        }
        return { ...college, matchPercentage: score, matchReasons };
      })
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/recommendations/chatbot ──────────────────────────────────────
// Gemini-powered AI Career Counselor
router.post('/chatbot', protect, async (req, res) => {
  try {
    const { query, history } = req.body;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const geminiEnabled = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE';

    let answer, disclaimer;

    if (geminiEnabled) {
      // Fetch relevant college context for Gemini
      let collegeContext = '';
      try {
        const colleges = await College.find({ isActive: true })
          .select('name type tier location averageFees rankings placementData courses entranceExams')
          .limit(20).lean();
        
        collegeContext = colleges.map(c =>
          `${c.name} (${c.type}, ${c.location?.state}): Fees ₹${(c.averageFees/100000).toFixed(1)}L, NIRF #${c.rankings?.nirf||'N/A'}, Avg Pkg: ${c.placementData?.[0]?.averagePackage||'?'}LPA, Exams: ${c.entranceExams?.join('/')||'N/A'}`
        ).join('\n');
      } catch {}

      try {
        answer = await chatWithCounselor(query, collegeContext);
        disclaimer = 'Powered by Google Gemini AI. Verify information with official college websites.';
      } catch (geminiErr) {
        console.warn('Gemini chatbot error:', geminiErr.message);
        answer = getFallbackAnswer(query);
        disclaimer = 'AI service temporarily unavailable. Using cached responses.';
      }
    } else {
      answer = getFallbackAnswer(query);
      disclaimer = 'Add GEMINI_API_KEY to server/.env to enable full AI responses.';
    }

    res.json({
      success: true,
      data: { answer, disclaimer, sources: ['EduDiscover Database'] },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Fallback answers (when Gemini is unavailable) ────────────────────────────
function getFallbackAnswer(query) {
  const q = query.toLowerCase();
  if (q.includes('placement') || q.includes('package')) {
    return 'Top placements are at IITs (avg 28 LPA), NITs (avg 15 LPA), and BITS Pilani (avg 22 LPA). Government colleges generally offer better placement outcomes than private ones at similar fee levels.';
  }
  if (q.includes('fee') || q.includes('fees') || q.includes('cost')) {
    return 'IITs/NITs charge ₹1-2L/year. BITS Pilani ₹5-6L/year. Private colleges like VIT/SRM charge ₹3.5-5L/year. Government colleges are significantly cheaper and often have better outcomes.';
  }
  if (q.includes('jee') || q.includes('rank')) {
    return 'JEE Advanced rank under 1000 → IIT Bombay/Delhi CS. Under 5000 → other IIT branches. JEE Mains rank under 1000 → NIT Trichy/BITS (BITSAT). Use our AI Match tool for personalized cutoff estimates.';
  }
  if (q.includes('computer') || q.includes('cs') || q.includes('software')) {
    return 'Top CS colleges: IIT Bombay (#1), IIT Delhi (#2), BITS Pilani, NIT Trichy, VIT Vellore. For AI/ML specialization: IIT Hyderabad, IIT Bombay, IIIT Hyderabad are excellent.';
  }
  return 'I can help you with college comparisons, fees, placements, and entrance exam guidance. Try asking about specific colleges, courses, or locations! For best results, add a Gemini API key to enable full AI responses.';
}

module.exports = router;

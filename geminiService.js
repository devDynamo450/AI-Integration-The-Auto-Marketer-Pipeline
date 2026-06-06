/**
 * geminiService.js
 * Central Google Generative AI (Gemini) service.
 * Powers: Chatbot, AI-Search, College summaries, Review analysis.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getClient() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_KEY_HERE') {
      throw new Error('GEMINI_API_KEY is not configured. Add it to server/.env');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
}

// ─── 1. AI Chatbot (Career Counselor) ────────────────────────────────────────
async function chatWithCounselor(query, collegeContext = '') {
  const m = getClient();

  const systemPrompt = `You are EduDiscover's AI Career Counselor for Indian higher education.
You help students choose colleges with honest, unbiased, data-driven advice.
You know about IITs, NITs, IIITs, private colleges, entrance exams (JEE, NEET, BITSAT, etc).
Tone: friendly, concise, factual. No fluff. Max 200 words per answer.
${collegeContext ? `\nDatabase context:\n${collegeContext}` : ''}

Rules:
- Never recommend based on ads or paid placements
- Always mention NIRF rankings when relevant  
- Suggest entrance exams required for the college
- If unsure, say so honestly`;

  const prompt = `${systemPrompt}\n\nStudent Question: ${query}`;
  const result = await m.generateContent(prompt);
  return result.response.text();
}

// ─── 2. AI-Powered College Search ────────────────────────────────────────────
async function semanticSearchColleges(query, colleges) {
  const m = getClient();

  const collegeList = colleges.slice(0, 30).map(c =>
    `ID:${c._id}|Name:${c.name}|Type:${c.type}|State:${c.location?.state}|Fees:₹${(c.averageFees/100000).toFixed(1)}L|NIRF:#${c.rankings?.nirf||'N/A'}|Avg Pkg:${c.placementData?.[0]?.averagePackage||'?'}LPA`
  ).join('\n');

  const prompt = `You are a college search assistant. Given this student query, return the IDs of the most relevant colleges from the list below.

Query: "${query}"

Colleges:
${collegeList}

Return ONLY a JSON array of college IDs that best match the query, sorted by relevance. Example: ["id1","id2","id3"]
Return maximum 10 results. Return [] if no good match.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text().trim();
  
  // Extract JSON array from response
  const match = text.match(/\[.*\]/s);
  if (!match) return [];
  
  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

// ─── 3. AI College Summary Generator ─────────────────────────────────────────
async function generateCollegeSummary(college) {
  const m = getClient();

  const prompt = `Write a concise, unbiased 3-sentence summary for this Indian college for prospective students:
Name: ${college.name}
Type: ${college.type}, Tier: ${college.tier}
Location: ${college.location?.city}, ${college.location?.state}
NIRF Rank: ${college.rankings?.nirf || 'Not ranked'}
Average Fees: ₹${(college.averageFees/100000).toFixed(1)}L/year
Placement Rate: ${college.placementData?.[0]?.placementRate || 'N/A'}%
Average Package: ${college.placementData?.[0]?.averagePackage || 'N/A'} LPA
Courses: ${college.courses?.map(c=>c.name).join(', ') || 'Various'}

Be honest and factual. Mention key strengths and weaknesses. No marketing language.`;

  const result = await m.generateContent(prompt);
  return result.response.text();
}

// ─── 4. AI Sentiment Analysis on Reviews ─────────────────────────────────────
async function analyzeReviewSentiment(reviewText) {
  const m = getClient();

  const prompt = `Analyze this college review for authenticity and sentiment. Return JSON only.

Review: "${reviewText}"

Respond with exactly this JSON (no markdown, no code block):
{
  "label": "genuine" | "promotional" | "suspicious" | "negative" | "mixed",
  "score": <number between -1 and 1>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<one sentence explanation>"
}

Criteria:
- "promotional": overly positive, no specific details, sounds like marketing
- "suspicious": contains competitor bashing or fake-sounding claims  
- "genuine": specific, balanced, mentions both pros and cons
- "negative": consistently critical, mentions real problems
- "mixed": has genuine elements of both positive and negative`;

  const result = await m.generateContent(prompt);
  const text = result.response.text().trim();
  
  try {
    // Remove any markdown code blocks if present
    const clean = text.replace(/```json?/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { label: 'genuine', score: 0.5, confidence: 0.5, reasoning: 'Could not analyze' };
  }
}

// ─── 5. AI Recommendation Reasoning ─────────────────────────────────────────
async function explainRecommendation(student, college, matchScore) {
  const m = getClient();

  const prompt = `Explain in 2 bullet points why this college is a ${matchScore}% match for this student.
Be specific and honest.

Student: ${student.percentage12th}% in 12th, Budget ₹${(student.budgetMax/100000).toFixed(1)}L, 
Preferred: ${student.preferredCourses?.join(', ')||'Any'}, States: ${student.preferredStates?.join(', ')||'Any'}
${student.jeeRank ? `JEE Rank: ${student.jeeRank}` : ''}

College: ${college.name} (${college.type}, ${college.tier})
Fees: ₹${(college.averageFees/100000).toFixed(1)}L/yr, NIRF #${college.rankings?.nirf||'N/A'}
Placement: ${college.placementData?.[0]?.averagePackage||'N/A'} LPA avg, ${college.placementData?.[0]?.placementRate||'N/A'}% placed

Return ONLY 2 short bullet points starting with • (no markdown, no headers).`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  return text.split('\n').filter(l => l.trim().startsWith('•')).slice(0, 2);
}

module.exports = {
  chatWithCounselor,
  semanticSearchColleges,
  generateCollegeSummary,
  analyzeReviewSentiment,
  explainRecommendation,
};

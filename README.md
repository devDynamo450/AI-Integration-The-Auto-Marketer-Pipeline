# 🎓 EduDiscover — AI-Powered Higher Education Discovery Platform

> An intelligent full-stack platform that helps Indian students find, compare, and get AI-driven recommendations for colleges using Google Gemini AI and a content-based ML engine.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Reference](#-api-reference)
- [ML Service](#-ml-service)
- [AI Capabilities (Gemini)](#-ai-capabilities-gemini)
- [Data Models](#-data-models)

---

## 🌟 Overview

**EduDiscover** is a three-tier web application designed to simplify higher education discovery for Indian students. It combines a **React/Vite frontend**, a **Node.js/Express REST API**, and a **Python FastAPI ML microservice** to deliver:

- Personalized college recommendations using content-based filtering
- Google Gemini-powered AI career counseling chatbot
- Semantic college search powered by Gemini AI
- AI-generated college summaries and review sentiment analysis

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **College Search & Filter** | Browse, search, and filter 1000s of colleges by type, location, fees, NIRF ranking |
| 🤖 **AI Career Counselor** | Gemini-powered chatbot with domain knowledge about IITs, NITs, JEE, NEET, BITSAT |
| 🎯 **Smart Recommendations** | Personalized college matches based on academic profile, budget, location & courses |
| 📊 **AI College Summaries** | Auto-generated, unbiased 3-sentence summaries for each college via Gemini |
| 🔎 **Semantic Search** | Natural language college search ("affordable CS college in South India") |
| 📝 **Review Sentiment Analysis** | AI flags promotional or suspicious reviews using Gemini + rule-based fallback |
| 💡 **Match Reasoning** | Gemini explains *why* a college is a good fit for a specific student |
| 👤 **User Auth** | JWT-based registration, login, and persistent academic profiles |
| 📈 **Student Dashboard** | Personalized dashboard with saved colleges, recommendations, and profile stats |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| Vite | 8 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Zustand | 5 | Global state management |
| TanStack Query | 5 | Server state & data fetching |
| Framer Motion | 12 | Animations & transitions |
| Recharts | 3 | Data visualization |
| Lucide React | latest | Icon library |
| React Hot Toast | 2 | Notifications |
| TailwindCSS | 3 | Utility-first styling |

### Backend (Node.js)
| Technology | Version | Purpose |
|---|---|---|
| Express | 5 | HTTP server & routing |
| Mongoose | 9 | MongoDB ODM |
| `@google/generative-ai` | 0.24 | Gemini AI integration |
| JWT + bcryptjs | — | Authentication & password hashing |
| Helmet | 8 | HTTP security headers |
| Morgan | 1 | Request logging |
| Nodemon | 3 | Dev hot-reload |

### ML Microservice (Python)
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | latest | REST API framework |
| Uvicorn | latest | ASGI server |
| Pydantic | 2 | Data validation |
| NumPy | latest | Numerical computing |
| python-dotenv | latest | Environment config |

### Database
| Technology | Purpose |
|---|---|
| MongoDB (local) | Primary database — colleges, students, reviews |

---

## 📁 Project Structure

```
nvidia project2/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Landing page
│   │   │   ├── CollegesPage.jsx      # Browse & filter colleges
│   │   │   ├── CollegeDetailPage.jsx # Individual college profile
│   │   │   ├── RecommendationsPage.jsx # AI-matched colleges
│   │   │   ├── ChatbotPage.jsx       # AI career counselor
│   │   │   ├── DashboardPage.jsx     # User dashboard
│   │   │   ├── LoginPage.jsx         # Authentication
│   │   │   └── RegisterPage.jsx      # Registration
│   │   ├── components/
│   │   │   ├── CollegeCard.jsx       # Reusable college card
│   │   │   ├── FilterSidebar.jsx     # Search/filter panel
│   │   │   └── Navbar.jsx            # Navigation bar
│   │   ├── store/                    # Zustand state stores
│   │   ├── hooks/                    # Custom React hooks
│   │   └── lib/                      # Utilities & API client
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express backend
│   ├── routes/
│   │   ├── auth.js               # POST /api/auth/register, /login, /logout
│   │   ├── colleges.js           # GET/POST /api/colleges (CRUD + AI search)
│   │   ├── recommendations.js    # POST /api/recommendations (+ /chatbot)
│   │   ├── reviews.js            # GET/POST /api/reviews (+ sentiment)
│   │   └── users.js              # GET/PUT /api/users (profile management)
│   ├── models/
│   │   ├── College.js            # College schema (placements, rankings, courses)
│   │   ├── Review.js             # Review schema with sentiment fields
│   │   └── Student.js            # User/student schema with academic profile
│   ├── services/
│   │   └── geminiService.js      # All Gemini AI integrations (5 functions)
│   ├── middleware/
│   │   └── auth.js               # JWT protect middleware
│   ├── scripts/
│   │   └── seedData.js           # Database seeding script
│   ├── server.js                 # Express app entry point
│   └── .env                      # Environment variables
│
└── ml_service/                 # Python FastAPI ML microservice
    ├── main.py                   # FastAPI app (recommend, sentiment, chat)
    └── requirements.txt          # Python dependencies
```

---

## 📦 Prerequisites

Make sure the following are installed on your system:

- **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
- **Python** ≥ 3.9 — [python.org](https://python.org)
- **MongoDB** (Community Server) — [mongodb.com](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

---

## 🚀 Getting Started

### 1. Clone / Open the Project

```bash
cd "nvidia project2"
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Install ML Service Dependencies

```bash
cd ../ml_service
pip install fastapi uvicorn[standard] pydantic python-dotenv numpy
```

> ⚠️ If you're on Python 3.14+, use the command above (latest versions). The pinned versions in `requirements.txt` only support up to Python 3.12.

### 5. Configure Environment Variables

Edit `server/.env` (see [Environment Variables](#-environment-variables) below).

### 6. Seed the Database (Optional)

```bash
cd server
npm run seed
```

---

## ⚙️ Environment Variables

Create/edit `server/.env`:

```env
# Database
MONGO_URI=mongodb://localhost:27017/edu_discovery

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production_32chars
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# ML Microservice
ML_SERVICE_URL=http://localhost:8000

# Google Gemini AI  ← REQUIRED for AI features
GEMINI_API_KEY=PASTE_YOUR_GEMINI_KEY_HERE
```

> 💡 **Get a free Gemini API key** at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).  
> Without it, the app runs in fallback mode with cached responses — all other features still work.

---

## ▶️ Running the Application

Open **three terminal windows** and run each service:

### Terminal 1 — Backend (Node.js)
```bash
cd server
npm run dev
# → Running on http://localhost:5000
# → MongoDB connected successfully
```

### Terminal 2 — Frontend (Vite/React)
```bash
cd client
npm run dev
# → Running on http://localhost:5173
```

### Terminal 3 — ML Service (Python)
```bash
cd ml_service
python main.py
# → Uvicorn running on http://0.0.0.0:8000
```

Once all three are running, open **http://localhost:5173** in your browser.

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new student | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT cookie | ❌ |
| `POST` | `/api/auth/logout` | Clear auth cookie | ✅ |
| `GET` | `/api/auth/me` | Get current user profile | ✅ |

### Colleges — `/api/colleges`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/colleges` | List/search colleges (filters, pagination) | ❌ |
| `GET` | `/api/colleges/:id` | Get college details by ID or slug | ❌ |
| `POST` | `/api/colleges/ai-search` | Gemini-powered semantic search | ❌ |
| `POST` | `/api/colleges/:id/summary` | Generate AI summary for a college | ❌ |

### Recommendations — `/api/recommendations`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/recommendations` | Get personalized college matches | ✅ |
| `POST` | `/api/recommendations/chatbot` | Chat with AI Career Counselor | ✅ |

### Reviews — `/api/reviews`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/reviews/:collegeId` | Get reviews for a college | ❌ |
| `POST` | `/api/reviews` | Submit a review (AI sentiment analysis applied) | ✅ |

### Users — `/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/users/profile` | Get current user's full profile | ✅ |
| `PUT` | `/api/users/profile` | Update academic profile | ✅ |

### Health Check

```
GET /api/health
→ { "status": "OK", "service": "EduDiscover API", "version": "1.0.0" }
```

---

## 🤖 ML Service

The Python FastAPI microservice runs independently on port **8000** and exposes:

| Endpoint | Method | Description |
|---|---|---|
| `GET /health` | GET | Health check |
| `POST /recommend` | POST | Content-based college filtering (weighted scoring) |
| `POST /sentiment` | POST | Rule-based review sentiment analysis |
| `POST /chat` | POST | Keyword-based FAQ chatbot fallback |

### Recommendation Scoring Algorithm

The engine scores each college against a student profile using 6 weighted criteria:

| Criterion | Weight | Logic |
|---|---|---|
| Budget match | **30 pts** | Proportional to how far fees are below budget |
| Location preference | **20 pts** | Full points if state matches, partial otherwise |
| College type | **15 pts** | IIT/NIT/Private/Deemed preference matching |
| Academic suitability | **20 pts** | 12th % vs. college tier cutoff thresholds |
| Course availability | **10 pts** | Fuzzy match of preferred courses vs. offered courses |
| JEE rank eligibility | **5 pts** | Rank vs. NIRF-estimated cutoff |

Final score is clamped to **25–100%**, top 12–15 colleges are returned.

---

## 🧠 AI Capabilities (Gemini)

All Gemini features use the `gemini-1.5-flash` model and gracefully degrade to fallbacks when the API key is absent.

| Function | Trigger | Description |
|---|---|---|
| `chatWithCounselor()` | `/api/recommendations/chatbot` | Acts as an unbiased Indian higher-ed career counselor with real-time DB context |
| `semanticSearchColleges()` | `/api/colleges/ai-search` | Interprets natural language queries and returns relevant college IDs |
| `generateCollegeSummary()` | `/api/colleges/:id/summary` | Writes a factual 3-sentence summary for any college |
| `analyzeReviewSentiment()` | On review submission | Classifies reviews as `genuine`, `promotional`, `suspicious`, `negative`, or `mixed` |
| `explainRecommendation()` | Top-5 recommendations | Returns 2 bullet-point reasons why a college is a good match for a student |

---

## 🗄️ Data Models

### College
Key fields: `name`, `type` (IIT/NIT/Private/…), `tier`, `location`, `courses[]`, `rankings` (NIRF, QS), `averageFees`, `entranceExams[]`, `placementData[]`, `cutoffs[]`, `accreditation`, `aiSummary`, `sentimentScore`, `overallRating`

### Student (User)
Key fields: `name`, `email`, `passwordHash`, `academicProfile` (`percentage12th`, `preferredCourses`, `budgetMax`, `preferredStates`, `jeeRank`), `savedColleges[]`

### Review
Key fields: `college` (ref), `student` (ref), `rating`, `text`, `sentimentLabel`, `sentimentScore`, `isVerified`

---

## 📄 License

This project was built for the NVIDIA × higher education AI challenge.

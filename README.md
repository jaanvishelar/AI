# MerchantMind AI

> **Your AI Data Scientist for Smarter Merchant Growth**  
> *Track: AI Growth & Agentic Commerce*

---

## 🚀 Overview

**MerchantMind AI** is an intelligent commerce intelligence platform designed to bridge raw transaction data and autonomous revenue growth. 

### Core Vision:
`Merchant Data → AI Analysis → Revenue Insights → Growth Recommendation → Human Approval → Razorpay Test-Mode Action → Audit Trail`

### Phase 1 Focus (Current):
**Merchant Data → Data Analysis Dashboard**  
This foundation establishes an automated data science pipeline:
* **Zero-Configuration Heuristic Profiling:** Automatically infers column roles (revenue, customers, products, order dates, discounts, cities, channels) without hardcoded schemas.
* **Objective Data Quality Scoring (0–100):** Mathematically measures missing values, duplicates, and price anomalies from real uploaded spreadsheets.
* **Non-Destructive AI Data Preparation:** Detects data hygiene opportunities without ever modifying or overwriting the original source data.
* **Financial & Retention KPIs:** Calculates net revenue, orders, Average Order Value (AOV), unique customers, repeat purchase rates, and return rates.
* **Interactive Visualizations:** Built with Recharts for time-series revenue trends, category breakdowns, regional sales distributions, and payment status channels.
* **UrbanCart Synthetic Demo:** One-click instant demonstration with ~5,280 realistic transaction records.

> ⚠️ **Notice:** In Phase 1, live Razorpay transactions and autonomous agent actions are not executed. Architectural hooks and services are pre-built to connect in subsequent phases.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS (Modern SaaS Analytics Design System)
* **Icons:** Lucide React
* **Charts:** Recharts (Area, Bar, Pie/Donut charts)
* **Spreadsheet Parsing:** PapaParse (CSV) & SheetJS XLSX (Excel)

### Backend
* **Language:** Python 3.10+
* **Framework:** FastAPI (RESTful JSON APIs)
* **Data Processing:** pandas & numpy
* **Validation:** Pydantic V2 schemas
* **Server:** Uvicorn ASGI

---

## 📁 Project Structure

```
merchantmind-ai/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entrypoint & CORS
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # /api/upload, /api/demo, /api/health
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── models.py           # Pydantic response models
│   │   ├── analytics/
│   │   │   ├── __init__.py
│   │   │   ├── heuristics.py       # Heuristic column role detector
│   │   │   ├── quality.py          # Data quality scorer (0-100)
│   │   │   ├── metrics.py          # Revenue, AOV & chart aggregators
│   │   │   └── cleaning.py         # Non-destructive preparation rules
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── data_service.py     # Tabular file parsing & pipeline
│   │   │   ├── ai_placeholder.py   # Future Gemini AI service architecture
│   │   │   └── razorpay_placeholder.py # Future Razorpay service architecture
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── synthetic_generator.py # UrbanCart demo generator
│   └── requirements.txt            # Python dependencies
│
├── src/                            # React TypeScript Frontend
│   ├── components/
│   │   ├── landing/
│   │   │   └── LandingPage.tsx     # SaaS Hero landing page & simplified flow
│   │   └── dashboard/
│   │       ├── Header.tsx          # Top navbar with dataset status pill
│   │       ├── Sidebar.tsx         # Left navigation (Phase 1 vs Roadmap)
│   │       ├── EmptyState.tsx      # Drag & drop upload + demo button
│   │       ├── LoadingAnalysis.tsx # Multi-step visual progress indicator
│   │       ├── OverviewView.tsx    # KPI cards, Revenue Trend, Recharts
│   │       ├── DataView.tsx        # Data profile, Quality score meter, Preview
│   │       ├── ComingSoonView.tsx  # Honest Phase 2 & 3 capability previews
│   │       ├── UploadModal.tsx     # Drag-and-drop CSV/XLSX modal
│   │       └── CleaningModal.tsx   # Non-destructive cleaning review modal
│   ├── data/
│   │   └── syntheticDemo.ts        # UrbanCart synthetic dataset generator (~5.2k rows)
│   ├── hooks/
│   │   └── useMerchantData.ts      # State management hook & pipeline driver
│   ├── layouts/
│   │   └── DashboardLayout.tsx     # Responsive SaaS layout with mobile menu
│   ├── services/
│   │   ├── apiService.ts           # Unified API client + client-side fallback
│   │   ├── aiService.ts            # Architectural placeholder for Gemini API
│   │   └── razorpayService.ts      # Architectural placeholder for Razorpay
│   ├── types/
│   │   └── index.ts                # TypeScript domain models & schemas
│   ├── utils/
│   │   └── dataAnalytics.ts        # Profiling, quality scoring & KPIs engine
│   ├── App.tsx                     # Main application entry point
│   ├── main.tsx                    # React DOM root
│   └── index.css                   # Global Tailwind CSS
│
├── .env.example                    # Environment variable template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Installation & Getting Started

### 1. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start Vite development server (Port 3000)
npm run dev
```

### 2. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🔌 Frontend & Backend Communication

1. **File Upload Flow:**
   * When a merchant drops a `.csv` or `.xlsx` file, `apiService.uploadDataset(file)` sends a multipart `POST` request to `http://localhost:8000/api/upload`.
   * FastAPI's `DataService` reads the file with pandas (in memory, non-destructively).
   * It runs:
     1. `profile_dataset_columns()`: Detects data types & semantic roles (monetary, customer, date, etc.).
     2. `calculate_dataset_quality_score()`: Evaluates missing cells, duplicate orders, and price anomalies to generate a 0-100 score.
     3. `generate_cleaning_recommendations()`: Formulates non-destructive data health proposals.
     4. `calculate_kpis_and_charts()`: Computes total net revenue, AOV, order volume, repeat customer percentage, and Recharts aggregations.
   * Returns a structured `DatasetAnalysisResultSchema` JSON response to hydrate the React dashboard.
2. **Instant Demo Dataset:**
   * Clicking **"Try Demo Dataset"** calls `/api/demo` to instantly generate and analyze ~5,280 realistic **UrbanCart** multi-category transactions with real-world quality variations.
3. **Resilient Fallback:**
   * If the frontend runs standalone or offline, `apiService.ts` seamlessly executes the analytical pipeline in-browser using PapaParse and SheetJS.

---

## 🔐 Environment Variables

Template available in `.env.example`:
```env
# Frontend API endpoint (leave empty for same-origin proxy)
VITE_API_URL=

# Backend Gemini AI Model Key (Phase 2)
GEMINI_API_KEY=

# Razorpay Agentic Commerce Credentials (Phase 3)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 🗺️ Product Roadmap

* **Phase 1 (Complete):** Data ingestion, heuristic profiling, data quality scoring (0-100), financial KPIs, and Recharts visual dashboard.
* **Phase 2 (Next):** Gemini 2.5 AI integration for conversational data inquiries, autonomous customer churn modeling, and automated growth playbooks.
* **Phase 3 (Agentic Commerce):** Human-in-the-Loop approval workflows, Razorpay Test-Mode payment link dispatch, dynamic coupon creation, and cryptographically verified audit trails.

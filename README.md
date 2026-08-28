# MerchantMind AI 🚀

> **Your AI Data Scientist for Smarter Merchant Growth**

**Hackathon Track: AI Growth & Agentic Commerce**

MerchantMind AI is an end-to-end merchant intelligence platform that transforms transaction data into **actionable business insights, revenue opportunities, predictive signals, and safe human-approved commerce actions**.

The platform connects the complete journey:

**Merchant Data → Analytics → AI Insights → ML Predictions → Growth Opportunities → Human Approval → Razorpay TEST MODE → Verification → Audit Trail**

---

## 🎯 The Problem

Merchants generate large amounts of transaction data, but raw data alone does not tell them:

- Where revenue is being lost
- Which customers are most valuable
- Which customers may churn
- Which products drive revenue
- Where payment failures are occurring
- Which revenue opportunities should be acted on first
- How an AI system can safely take action without making uncontrolled financial decisions

MerchantMind AI addresses this gap by combining **data intelligence, AI reasoning, predictive analytics, growth opportunity detection, and governed agentic commerce** in one platform.

---

# 💡 What MerchantMind AI Does

MerchantMind AI turns raw transaction data into a complete decision and action workflow:

```text
                MERCHANT DATA
                     │
                     ▼
              DATA INTELLIGENCE
          Schema + Quality Analysis
                     │
                     ▼
                ANALYTICS
       Revenue / Customers / Products
          Payments / Geography
                     │
                     ▼
                 AI INSIGHTS
          Evidence-backed reasoning
                     │
                     ▼
              ML PREDICTIONS
           Customer risk signals
                     │
                     ▼
             GROWTH ENGINE
         Revenue opportunities
                     │
                     ▼
             HUMAN APPROVAL
          Bounded action proposal
                     │
                     ▼
            SAFETY VALIDATION
             Policy checks
                     │
                     ▼
           RAZORPAY TEST MODE
             No real money
                     │
                     ▼
          WEBHOOK / EVENT LOG
                     │
                     ▼
               AUDIT TRAIL
```

---

# ✨ Key Features

## 1. 📊 Automated Data Intelligence

MerchantMind AI accepts transactional datasets in:

- CSV
- Excel / XLSX
- Synthetic demonstration data

The system analyzes the uploaded dataset and identifies important transaction fields automatically.

### Automated schema understanding

The platform can identify fields such as:

- Transaction ID
- Customer ID
- Product ID
- Product name
- Order date
- Revenue / price
- Quantity
- Discounts
- Payment status
- City
- Acquisition channel
- Product category

### Data quality analysis

MerchantMind AI calculates a data health score based on signals such as:

- Missing values
- Duplicate records
- Data completeness
- Transaction consistency
- Potential anomalies

The analysis is designed to be **non-destructive**, meaning the original uploaded dataset is not overwritten by the preparation process.

---

# 📈 2. Merchant Analytics

After ingestion, MerchantMind AI generates an interactive analytics dashboard.

### Financial Intelligence

The dashboard provides:

- Total net revenue
- Total orders
- Average Order Value (AOV)
- Revenue trends
- Category revenue
- City-wise revenue
- Acquisition-channel performance

### Customer Intelligence

The platform analyzes:

- Unique customers
- Repeat customers
- Repeat purchase rate
- Customer revenue contribution
- Purchase behavior
- Customer cohorts

### Product Intelligence

The platform identifies:

- Top revenue-driving products
- Product sales volume
- Category performance
- Revenue concentration
- Cross-sell opportunities

### Payment Intelligence

Payment analytics include:

- Completed payments
- Failed payments
- Pending payments
- Refunded orders
- Failed transaction value
- Potential payment-related revenue leakage

---

# 🤖 3. AI-Powered Merchant Insights

MerchantMind AI uses AI reasoning to turn calculated merchant analytics into understandable business recommendations.

Instead of providing generic advice, the system presents insights together with supporting evidence.

Each insight can contain:

- Insight title
- Confidence level
- Supporting metrics
- Calculated evidence
- Recommended action
- Business explanation

### Example

```text
Customer Retention Opportunity

Evidence:
• High percentage of repeat customers
• Significant revenue contribution from returning buyers
• Strong purchase frequency

Recommendation:
Create a VIP loyalty tier or automated
replenishment/reminder workflow.
```

The objective is to make AI recommendations **explainable and evidence-backed**.

---

# 🧠 4. Predictions & Customer Intelligence

MerchantMind AI can use customer behavioral signals to identify potential opportunities.

Customer behavior can be represented using signals such as:

- Recency
- Frequency
- Monetary value
- Purchase cadence
- Inactivity

These signals can be used to identify customer groups such as:

```text
Customer Behavior
       │
       ▼
Behavioral Features
       │
       ▼
Customer Risk / Opportunity
       │
       ▼
Retention Opportunity
```

This allows merchants to move from simply understanding past transactions toward identifying customers who may require attention.

---

# 🚀 5. Growth Opportunity Engine

The Growth Engine converts merchant analytics and predictive signals into ranked revenue opportunities.

Each opportunity can include:

- Opportunity type
- Target cohort
- Supporting evidence
- Historical value
- Estimated recoverable value
- Recommended action
- Execution boundary

### Example Growth Opportunities

#### 💳 Failed Payment Recovery

```text
Failed Transactions
        ↓
Calculate Failed Value
        ↓
Estimate Conservative Recovery
        ↓
Create Bounded Opportunity
        ↓
Human Approval
```

Example demonstration:

```text
Failed transaction value:
₹19,917

Estimated recoverable opportunity:
₹4,979

Target:
244 failed transaction attempts
```

The actual values shown in the application are calculated from the demonstration dataset.

---

## 🛒 AOV Improvement

The system can identify opportunities where complementary products could potentially increase basket size.

```text
Single-item purchases
        ↓
Identify complementary products
        ↓
Create cross-sell opportunity
        ↓
Estimate potential value
```

---

## ❤️ Customer Retention

Potential retention opportunities can be identified from customer behavior.

```text
Customer behavior
        ↓
Identify declining activity
        ↓
Prioritize customer cohort
        ↓
Recommend retention action
```

---

## 🧩 Product Cross-Sell

The Growth Engine can identify opportunities to introduce complementary products to existing buyers.

```text
Product A buyers
       ↓
Analyze purchasing behavior
       ↓
Identify complementary products
       ↓
Create cross-sell opportunity
```

---

# 💳 6. Agentic Commerce

MerchantMind AI demonstrates how AI-generated growth opportunities can connect to a controlled commerce action.

The critical design principle is:

> **AI recommends. Humans authorize. Safety policies constrain execution.**

The AI does **not** get unrestricted permission to execute financial actions.

Instead:

```text
AI Opportunity
      ↓
Bounded Proposal
      ↓
Human Approval
      ↓
Safety Validation
      ↓
TEST MODE Action
      ↓
Verification
      ↓
Audit Trail
```

---

# 🔐 7. Human-in-the-Loop Approval

Before an agentic commerce action can proceed, the merchant is shown a controlled approval interface.

The approval screen can display:

- Target cohort
- Historical transaction value
- AI opportunity estimate
- Maximum execution ceiling
- Merchant-approved limit
- Safety policies
- Action explanation

Example:

```text
Human Approval Gate

Target:
Failed payment transactions

Historical Value:
₹20,446

AI Bounded Opportunity:
₹7,156

Maximum Execution Ceiling:
₹7,156
```

The merchant must explicitly approve the action.

---

# 🛡️ 8. Safety & Governance

MerchantMind AI is designed with safety boundaries around commerce actions.

Key controls include:

| Safety Control | Purpose |
|---|---|
| Human Approval | Prevent uncontrolled execution |
| TEST MODE | Prevent real-money transactions |
| Amount Ceiling | Limit maximum action value |
| Idempotency | Prevent duplicate execution |
| Policy Validation | Verify safety constraints |
| Secret Protection | Prevent credential exposure |
| Failure Simulation | Test failure handling |
| Safe Retry | Support controlled recovery |
| Webhook Verification | Validate payment events |
| Audit Trail | Record execution history |
| Decision Trace | Explain action reasoning |
| Live Mode Block | Prevent production execution |

---

# 💰 9. Razorpay TEST MODE

MerchantMind AI uses **Razorpay TEST MODE** for the commerce demonstration.

> ⚠️ **No real customer money should be moved through this demonstration.**

The intended workflow is:

```text
Growth Opportunity
        ↓
Bounded Proposal
        ↓
Human Approval
        ↓
Policy Validation
        ↓
Razorpay TEST MODE
        ↓
Test Payment Event
        ↓
Verification
        ↓
Audit Trail
```

Production/live payment execution is intentionally outside the demonstration safety boundary.

---

# 🔁 10. Controlled Failure & Safe Retry

A major part of the demonstration is showing how the system handles failure safely.

The application can simulate a controlled gateway failure.

Example lifecycle:

```text
ACTION_APPROVAL_REQUESTED
          ↓
ACTION_PREPARED
          ↓
ACTION_APPROVED
          ↓
POLICY_VALIDATION_PASSED
          ↓
RAZORPAY_REQUEST_STARTED
          ↓
ACTION_FAILED
          ↓
RETRY AVAILABLE
```

The important behavior is that a failed action does not silently become a successful transaction.

The system preserves the action state and provides a controlled retry path.

---

# 🔂 11. Idempotent Execution

Commerce systems must avoid accidentally executing the same action multiple times.

MerchantMind AI uses an idempotency concept to ensure that retries do not unintentionally create duplicate actions.

```text
Action Attempt #1
       ↓
Failure
       ↓
Retry
       ↓
Same Idempotency Context
       ↓
Prevent Duplicate Execution
```

This is especially important when dealing with payment-related workflows.

---

# 🔔 12. Webhook Verification

The commerce workflow can process payment events through a webhook lifecycle.

Conceptually:

```text
TEST PAYMENT
      ↓
Webhook Event
      ↓
Verification
      ↓
Event Accepted
      ↓
Action State Updated
      ↓
Audit Event Recorded
```

Webhook verification helps ensure that payment events are not blindly trusted.

---

# 📜 13. Explainable Audit Trail

Every important commerce action is associated with an execution history.

Example successful flow:

```text
ACTION_APPROVAL_REQUESTED
ACTION_PREPARED
ACTION_APPROVED
POLICY_VALIDATION_PASSED
RAZORPAY_REQUEST_STARTED
RAZORPAY_RESOURCE_CREATED
PAYMENT_EVENT_RECEIVED
WEBHOOK_VERIFIED
ACTION_COMPLETED
```

Example failed flow:

```text
ACTION_APPROVAL_REQUESTED
ACTION_PREPARED
ACTION_APPROVED
POLICY_VALIDATION_PASSED
RAZORPAY_REQUEST_STARTED
ACTION_FAILED
```

The audit trail helps answer:

- Why was this action proposed?
- Which data created the opportunity?
- What was the calculated opportunity value?
- Who approved it?
- What safety checks were performed?
- Did execution succeed or fail?
- Was a retry performed?
- Was the payment event verified?

This creates an explainable chain from **data → decision → action → result**.

---

# 🧪 14. UrbanCart Synthetic Demo Dataset

MerchantMind AI includes a synthetic retail dataset called **UrbanCart** for demonstration and testing.

The dataset contains approximately:

```text
~5,282 transactions

Multiple categories
Multiple cities
Multiple acquisition channels
Multiple payment statuses
Repeat customers
Failed transactions
Refunds
Missing values
Duplicate records
Realistic transaction variation
```

The dataset intentionally includes data-quality nuances so the data profiling and analytics capabilities can be demonstrated.

### Example Demo Metrics

The dashboard can calculate metrics such as:

```text
Total Revenue
Total Orders
Average Order Value
Unique Customers
Repeat Customer Rate
Payment Success Rate
Refund Rate
Failed Payment Rate
```

All displayed metrics are derived from the loaded dataset.

---

# 🖥️ Dashboard

MerchantMind AI provides a merchant-focused dashboard containing modules such as:

### Overview

- Revenue KPIs
- Orders
- AOV
- Customer metrics
- Revenue trends

### Data & Schema

- Dataset profile
- Detected columns
- Missing values
- Duplicate detection
- Data quality score
- Data preview

### AI Analyst

- AI-generated merchant insights
- Evidence
- Confidence
- Recommendations

### Predictions & ML

- Customer behavioral analysis
- Risk/opportunity signals
- Customer segmentation

### Growth Actions

- Ranked opportunities
- Revenue opportunity estimates
- Target cohorts
- Recommended actions

### Agentic Commerce

- Human approval
- Bounded actions
- Safety policies
- Razorpay TEST MODE
- Controlled failure
- Retry handling

### Audit Trail

- Action history
- Decision trace
- Policy validation
- Execution status
- Payment events

---

# 🏗️ Architecture

```text
┌───────────────────────────────────────────┐
│              React Frontend               │
│        Dashboard + Analytics UI            │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│             Data Intelligence              │
│ Schema Detection + Quality + KPIs         │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│             AI / ML Layer                  │
│ Gemini Insights + Customer Predictions    │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│              Growth Engine                 │
│ Opportunity Detection + Opportunity Size  │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│          Agentic Commerce Layer            │
│ Approval + Policy + Bounds + Idempotency  │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│           Razorpay TEST MODE               │
│             Test Payment Flow              │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│          Verification + Audit              │
│       Webhooks + Decision Trace            │
└───────────────────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Recharts

## Data Processing

- Python
- pandas
- NumPy
- PapaParse
- SheetJS / XLSX

## Backend

- FastAPI
- Python
- Pydantic
- Uvicorn

## AI

- Google Gemini

## Machine Learning

- Python
- Behavioral/RFM-style customer analysis
- Churn-risk modeling

## Payments

- Razorpay TEST MODE

---

# 📁 Project Structure

```text
AI/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── analytics/
│       ├── schemas/
│       ├── services/
│       └── utils/
│
├── src/
│   ├── components/
│   │   ├── landing/
│   │   └── dashboard/
│   │
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── services/
│   ├── types/
│   └── utils/
│
├── server/
│   └── razorpay/
│
├── assets/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── metadata.json
└── README.md
```

---

# ⚙️ Installation

## Prerequisites

Install:

- Node.js 18+
- npm
- Python 3.10+
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/jaanvishelar/AI.git

cd AI
```

---

## 2. Install Frontend Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
VITE_API_URL=

GEMINI_API_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### ⚠️ Security

Never commit real API credentials.

Commit:

```text
.env.example
```

Do not commit:

```text
.env
```

Make sure `.env` is included in `.gitignore`.

---

# ▶️ Run the Frontend

From the project root:

```bash
npm run dev
```

Open the local URL provided by Vite.

---

# ▶️ Run the Backend

Open another terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

# 🧪 Quick Demo

The fastest way to evaluate MerchantMind AI is to use the built-in UrbanCart demonstration dataset.

### Step 1

Launch the application.

### Step 2

Click:

**Try Demo Dataset**

### Step 3

Explore:

- Revenue
- Orders
- AOV
- Customers
- Products
- Categories
- Cities
- Payment statuses
- Acquisition channels

### Step 4

Open:

**AI Analyst**

Review the evidence-backed merchant insights.

### Step 5

Open:

**Predictions & ML**

Review customer behavioral and opportunity signals.

### Step 6

Open:

**Growth Actions**

Review the ranked revenue opportunities.

### Step 7

Select:

**Recover Failed Checkout Payments**

### Step 8

Review the human approval gate.

Check:

- Target cohort
- Historical value
- Opportunity estimate
- Execution ceiling
- Safety policies

### Step 9

Approve the TEST MODE action.

### Step 10

Use:

**Simulate Controlled Test Failure**

Verify that the system safely records the failure and exposes a retry path.

### Step 11

Continue with the controlled retry/test flow.

### Step 12

Open:

**Audit Trail**

Verify the complete decision and execution history.

---

# 🔐 Security Philosophy

MerchantMind AI follows a simple principle:

> **AI can recommend. Humans authorize. Safety policies constrain execution.**

The system therefore separates:

```text
INTELLIGENCE
     ↓
RECOMMENDATION
     ↓
BOUNDED PROPOSAL
     ↓
HUMAN AUTHORIZATION
     ↓
SAFETY VALIDATION
     ↓
TEST EXECUTION
     ↓
VERIFICATION
     ↓
AUDIT
```

This architecture is designed to prevent an AI recommendation from becoming an uncontrolled financial transaction.

---

# 🗺️ Development Status

| Phase | Capability | Status |
|---|---|---|
| Phase 1 | Data ingestion & profiling | ✅ |
| Phase 2 | Merchant analytics | ✅ |
| Phase 3 | AI insights | ✅ |
| Phase 4 | Predictive / ML intelligence | ✅ |
| Phase 5 | Growth opportunity engine | ✅ |
| Phase 6 | Agentic commerce demonstration | ✅ |
| Phase 7 | Production deployment | 🔮 Future |

---

# 🏆 Hackathon Differentiation

MerchantMind AI is built around three connected layers.

## 1. Intelligence

### What happened?

The analytics engine transforms raw transactions into measurable merchant intelligence.

---

## 2. Opportunity

### What should the merchant do?

AI and predictive signals identify potential revenue opportunities.

---

## 3. Action

### Can the next step be performed safely?

The agentic commerce layer adds:

- Human approval
- Execution boundaries
- Safety policies
- TEST MODE
- Idempotency
- Failure handling
- Verification
- Auditability

Together, this creates:

```text
DATA
 ↓
INTELLIGENCE
 ↓
DECISION
 ↓
ACTION
 ↓
VERIFICATION
 ↓
AUDIT
```

---

# 🎯 Why This Matters

Traditional analytics tools stop at:

```text
"Here is what happened."
```

MerchantMind AI aims to go further:

```text
"Here is what happened."
           ↓
"Here is the opportunity."
           ↓
"Here is why we found it."
           ↓
"Here is the recommended action."
           ↓
"Here is the maximum safe boundary."
           ↓
"You decide whether to execute it."
           ↓
"Here is exactly what happened."
```

This is the core idea behind **explainable and governed agentic commerce**.

---

# ⚠️ Demo & Safety Disclaimer

MerchantMind AI is a hackathon/demo project.

The commerce demonstration is designed around **Razorpay TEST MODE** and should not be used for production financial transactions.

Do not place production credentials in the repository.

Never commit:

```text
.env
API keys
Payment secrets
Private credentials
Production webhook secrets
```

Use environment variables or a dedicated secret-management solution for sensitive credentials.

---

# 🔮 Future Improvements

Potential future development includes:

- Production-grade authentication
- Multi-merchant accounts
- Role-based access control
- Real-time transaction streaming
- Advanced customer lifetime-value prediction
- Advanced churn modeling
- Automated campaign orchestration
- WhatsApp payment recovery
- Additional payment gateways
- Production webhook infrastructure
- Advanced anomaly detection
- Merchant-specific ML models
- Cloud deployment
- Monitoring and observability

---

# 👩‍💻 Author

## Jaanvi Jitendra Shelar

**MerchantMind AI**

**Hackathon Track:** AI Growth & Agentic Commerce

---

# 📄 License

This project is primarily developed as a hackathon/demo project.

See the repository for the applicable licensing information.

---

# ⭐ If You Like the Project

If MerchantMind AI demonstrates a useful approach to AI-powered merchant growth and governed agentic commerce, consider giving the repository a ⭐.

**MerchantMind AI**

> **From merchant data to intelligent, explainable and safely governed action.**

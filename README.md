# 🧠 Tech Truth Engine (SpecC)

### Turning product marketing into verifiable reality

---

Tech Truth Engine (SpecC) is a modular, AI-powered extension that analyzes consumer technology claims and converts them into structured, comparable, and decision-ready insights.

Instead of summarizing marketing, this system **interrogates it** — exposing ambiguity, normalizing specs, and revealing hidden trade-offs so users can make rational purchase decisions.

---

## 🚀 Core Capabilities

---

### 🔍 Claim Intelligence Engine

- Breaks down marketing into **atomic claims**
- Classifies each claim:
  - ✅ Verified  
  - ⚠️ Conditional  
  - ❌ Misleading  
  - ❓ Non-verifiable  
- Assigns **severity levels** (Low / Medium / High)

---

### 📊 Truth Scoring System

Each product is evaluated across four dimensions:

- **Transparency** – clarity of claims  
- **Verifiability** – ability to validate with evidence  
- **Comparability** – usefulness across products  
- **Consistency** – internal alignment of claims  

➡️ Output: **Normalized Truth Score (0–100)**

---

### 🔄 Spec Normalization Engine

Transforms vague marketing into technical meaning:

| Marketing Term        | Normalized Insight                     |
|----------------------|--------------------------------------|
| Motion Rate 240      | Estimated native refresh rate        |
| Unified Memory       | Shared system memory architecture    |
| AI-powered camera    | Software-enhanced imaging pipeline   |

---

### ⚖️ Trade-off Detection Layer

Surfaces hidden engineering compromises:

- Performance ↔ Battery life  
- Brightness ↔ Thermal constraints  
- Thin design ↔ Heat dissipation  

---

### 🌍 Real-World Interpretation

Bridges lab claims and actual usage:

- Peak vs sustained performance  
- Ideal vs typical conditions  
- Synthetic benchmarks vs real workloads  

---

### 💬 AI Analysis Interface *(In Progress)*

- Conversational querying over analyzed products  
- Context-aware responses grounded in extracted data  
- Designed to minimize hallucination  

---

## 📂 Project Structure

---
new-demo-main/
│
├── backend/
│ ├── main.py
│ ├── routes/
│ │ └── analyze.py
│ ├── models/
│ │ └── schemas.py
│ ├── services/
│ │ ├── ai_service.py
│ │ ├── llm_provider.py
│ │ ├── parser.py
│ │ ├── spec_c_engine.py
│ │ └── reddit_ingestion.py
│ └── requirements.txt
│
├── extension/
│ ├── manifest.json
│ ├── content.js
│ ├── background.js
│ ├── styles.css
│ └── icons/
│
├── frontend/
│ ├── src/
│ ├── public/
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
├── .env
└── .gitignore



---

## ⚙️ How It Works

---

### 🔄 Pipeline Flow

---

### 1. Extraction
Chrome extension detects product pages and extracts:
- Marketing content  
- Specifications  

---

### 2. Parsing
`parser.py` structures raw input into analyzable format  

---

### 3. Analysis
- `spec_c_engine.py` → claim evaluation  
- `ai_service.py` → LLM reasoning coordination  

---

### 4. Normalization
Converts ambiguous terms into standardized metrics  

---

### 5. Output
Structured JSON response containing:
- Truth Score  
- Claim classifications  
- Trade-offs  
- Real-world insights  

---

## 🧩 Tech Stack

---

### Backend
- FastAPI – high-performance API layer  
- Python – core processing  
- OpenAI API – reasoning & analysis  

---

### Frontend
- React (Vite) – fast UI development  
- Tailwind CSS – utility-first styling  

---

### Extension
- Chrome Extension APIs  
- DOM extraction + background messaging  

---

## 🧠 Development Timeline

---

### ⏱️ 11:00 AM – 3:00 PM
- Set up backend architecture using FastAPI  
- Structured project into routes, services, models  
- Created initial schemas and pipeline design  
- Bootstrapped Chrome extension  

---

### ⏱️ 3:00 PM – 6:00 PM
- Built AI analysis layer with LLM integration  
- Implemented API endpoints  
- Developed parsing + normalization logic  
- Tested request-response pipeline  

---

### ⏱️ 6:00 PM – 9:00 PM
- Connected system components end-to-end  
- Improved parser + SpecC engine consistency  
- Set up extension scripts (content + background)  
- Verified basic frontend-backend communication  

---

### ⏱️ 9:00 PM – 12:00 AM
- Refined claim classification logic  
- Improved Truth Score accuracy  
- Stabilized LLM provider interactions  
- Handled edge cases in unstructured data  

---

### ⏱️ 12:00 AM – 6:00 AM
- Integrated backend with UI + extension  
- Structured response for frontend rendering  
- Added chat-style querying interface  
- Improved clarity of outputs (TL;DR, insights, scoring)



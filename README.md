# AI Manufacturing Assistant 🚀

An AI-powered conversational manufacturing workflow platform that simplifies order processing, status tracking, and quality management using natural language interactions.

Built for Nova Nexus Hackathon 2025.

---

# 📌 Problem Statement

Precision manufacturing companies manage complex order lifecycles involving multiple stakeholders, status updates, and quality checkpoints.

Traditional workflows rely on:
- Emails
- Calls
- Spreadsheets
- Manual follow-ups

These methods are:
- Slow
- Error-prone
- Difficult to scale
- Hard to track in real time

The challenge is to build a conversational AI system where users interact entirely through natural language to:
- Place manufacturing orders
- Track order progress
- Log quality updates
- View operational dashboards

---

# 💡 Our Solution

AI Manufacturing Assistant replaces traditional operational workflows with a single AI-powered interface.

Users can communicate naturally with the system, while AI extracts structured information and automates manufacturing operations.

Example:

"Need 200 titanium flanges delivered by July 20"

The system automatically:
- Extracts order details
- Creates an order card
- Assigns workflow status
- Stores data in database/dashboard

---

# ✨ Core Features

## 🤖 Conversational Order Placement

Users place orders using plain English.

AI extracts:
- Part name
- Material
- Quantity
- Dimensions
- Delivery deadline

---

## 📊 Smart Status Management

Operations team can update order status conversationally.

Example:

"Order #42 has been accepted"

---

## 🛠 Quality Check Logging

Quality inspections and production notes are added through chat.

Example:

"Order #42 passed visual inspection"

All logs are timestamped automatically.

---

## 📋 Real-Time Dashboard

Dashboard displays:
- All active orders
- Current workflow stage
- Latest quality note
- Order timeline

---

# 🔄 Workflow Pipeline

Received
↓
In Review
↓
Accepted
↓
Production
↓
Quality Check
↓
Completed

---

# 🧠 Token Efficient Architecture

Our system is designed to minimize AI token usage and API costs.

## Techniques Used

### ✅ Stateless Extraction

Only current user message is sent to AI instead of full chat history.

### ✅ Minimal Prompt Design

Short extraction prompts reduce token consumption.

### ✅ Rule-Based Parsing

Simple status updates use regex/manual logic instead of AI calls.

### ✅ Structured Local Storage

Once extracted, order data is stored locally/database and reused without reprocessing.

---

# 🏗 System Architecture

                ┌─────────────────┐
                │   User Chat UI  │
                └────────┬────────┘
                         │
                         ▼
              ┌───────────────────┐
              │ AI NLP Extraction │
              └────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Backend Processing │
             └────────┬───────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌────────────────┐        ┌────────────────┐
│ Order Database │        │ Dashboard UI   │
└────────────────┘        └────────────────┘

---

# ⚙️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- TypeScript

## Backend
- Node.js
- Express.js

## Database
- MongoDB / LocalStorage

## AI / NLP
- OpenAI API / Gemini API

---

# 📂 Project Structure

src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── services/
 ├── utils/
 ├── types/
 ├── data/
 └── App.tsx

---

# 🎯 Objectives

- Simplify manufacturing workflows
- Reduce manual coordination
- Improve operational visibility
- Enable conversational operations
- Reduce AI operational costs
- Build scalable manufacturing automation

---

# 🚀 Future Enhancements

- Voice-enabled order processing
- ERP integration
- Predictive delivery estimation
- AI-powered production analytics
- Multi-factory support
- Supplier recommendation engine
- Role-based access control

---

# 🏆 Innovation Highlights

- Conversational manufacturing operations
- Token-efficient AI architecture
- Real-time workflow management
- AI + dashboard hybrid interface
- Minimal operational overhead

---

# 📸 Demo Flow

## Customer
Places order using natural language.

## Operations Team
Updates workflow stages through chat.

## Quality Team
Logs inspection reports conversationally.

## Management
Monitors entire production pipeline via dashboard.

---

# 🛠 Installation

## Clone Repository

```bash
git clone <repository-url>

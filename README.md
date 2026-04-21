<div align="center">

   <img width="203" height="52" alt="image" src="https://github.com/user-attachments/assets/9ce8457f-9dee-41de-9e7f-bbd634941062" />

# 🎯 AI Exam Evaluator

An intelligent, AI-powered system designed to automate the evaluation of exam papers, manage grading workflows, and generate high-quality question papers. Built with modern web technologies and powered by advanced AI models.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-18181A?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.io/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)](https://gemini.google.com/)
<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/d540ae6f-7c6c-4e16-b5ad-115db75659aa" />

---

A comprehensive platform mapping full-lifecycle evaluations—from straightforward PDF uploads to highly detailed, AI-graded automated results. 

</div>

## ✨ Key Features

- **🤖 AI-Powered Evaluation**: Utilize Google Gemini AI (incl. `gemini-3-flash-preview` model) to scrutinize, score, and provide feedback on student answers based on answer keys mapped directly from our dashboard.
- **📄 Document Processing**: Upload PDF exam papers with seamless data extraction ensuring evaluation workflows run securely. Graceful rejection systems block unsupported file types automatically.
- **📝 Automatic Paper Generation**: Effortlessly generate comprehensive IGCSE question papers tailored to curriculum variations and formats directly from the app.
- **📊 Interactive Display & Editing**: An intuitive UI letting educators review results, modify AI-calculated scores, and explicitly refine feedback before saving.
- **👥 Robust Admin Dashboard**: Complete role-based security separating regular users from advanced admins. Manage users, modify system configurations, handle defaults setup, and rotate evaluation API models.
- **💾 Auto-Save Drafts & Result Histories**: Never lose progress thanks to reliable auto-saving drafts for ongoing evaluations and persistent storage indexing past results for quick retrieval.
- **📱 Responsive, Fast UI**: Utilizing React 18, Vite, and Tailwind CSS provides a lazy-loaded, responsive view complete with animations across standard devices.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL for mapping relational data, Edge Functions using Deno for secured admin setups and validations)
- **AI Integration**: Google Gemini API endpoints
- **Testing**: End-to-End framework handled via robust mapped Python test suites (e.g., *TC001-TC017*).
- **Deployment**: Netlify configurations integrated with core build processes

## 🚀 Getting Started

### Prerequisites

You need the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) / [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- Development accounts for [Supabase](https://supabase.com/) and Google [Gemini API](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shakhawathossain07/AI-Exam-Evaluator-.git
   cd AI-Exam-Evaluator-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (checkout `.env.example` if available) and add:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: Detailed sensitive keys, like the `GEMINI_API_KEY` models and Admin configs are generally handled globally in the internal Admin Dashboard connected to your specific DB namespace layout using the Supabase Service key backend configurations.*

4. **Initialize Backend Edge Functions (Supabase)**:
   Deploy backend components primarily setting up default Admin via Edge function mapping:
   ```bash
   # Use the Supabase CLI if setup locally
   supabase functions deploy setup-default-admin 
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
├── src/                 # Main application source
│   ├── components/      # Standalone & reusable React components
│   ├── config/          # Configurations & variables mapping
│   ├── services/        # Supabase and API network implementations 
│   ├── hooks/           # Custom React hooks combining data mutations
│   ├── utils/           # Evaluation helpers, crypto, auth checks
│   └── App.tsx          # Main tree composition
├── supabase/            
│   ├── functions/       # Serverless Deno functions for backend handling
│   └── migrations/      # SQL queries & RLS mapping structures
├── testsprite_tests/    # E2E test scripts utilizing Python (TC1 - TC17)
└── public/              # Global static content & testing environments
```

## 🧪 Testing Protocol

The repository is built dynamically to support a major suite containing 17 testing endpoints (TC001 to TC017) handled locally using script environments (`setup-test-admin.js`, etc.) and mapped via testsprite plans (`testsprite_frontend_test_plan.json`). To validate integrations:

```bash
cd testsprite_tests
# Run auth validation tests
python TC001_User_authentication_with_valid_admin_credentials.py
# Run evaluation processing accuracy tests
python TC006_AI_powered_evaluation_produces_accurate_scores.py
```

## 🤝 Contributing

Contributions are always welcome. Feel free to open a Pull Request or browse the existing setup in the [issues page](https://github.com/shakhawathossain07/AI-Exam-Evaluator-/issues). Make sure to align with our local code structures and linting configurations (`eslint`, `tsc --noEmit`).

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

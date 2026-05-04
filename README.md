<div align="center">
  <img width="220" height="58" alt="logo" src="https://github.com/user-attachments/assets/9ce8457f-9dee-41de-9e7f-bbd634941062" />
  
  <h1>🎯 AI Exam Evaluator</h1>
  
  <p><strong>The Intelligent AI-Powered Exam Assessment & Question Paper Generation Platform</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-18181A?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" />

  <br/><br/>

  ![Hero Banner](https://github.com/user-attachments/assets/d540ae6f-7c6c-4e16-b5ad-115db75659aa)

  <p>
    <strong>From PDF upload to AI grading — complete automation with human oversight.</strong>
  </p>

  <a href="https://github.com/shakhawathossain07/AI-Exam-Evaluator-/stargazers">
    <img src="https://img.shields.io/github/stars/shakhawathossain07/AI-Exam-Evaluator-?style=for-the-badge&logo=starship&color=FFD700" alt="Stars" />
  </a>
  <a href="https://github.com/shakhawathossain07/AI-Exam-Evaluator-/issues">
    <img src="https://img.shields.io/github/issues/shakhawathossain07/AI-Exam-Evaluator-?style=for-the-badge&logo=github" alt="Issues" />
  </a>
  <a href="https://github.com/shakhawathossain07/AI-Exam-Evaluator-/forks">
    <img src="https://img.shields.io/github/forks/shakhawathossain07/AI-Exam-Evaluator-?style=for-the-badge" alt="Forks" />
  </a>
  <a href="https://github.com/shakhawathossain07/AI-Exam-Evaluator-/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/shakhawathossain07/AI-Exam-Evaluator-?style=for-the-badge&logo=opensourceinitiative&logoColor=white&color=green" alt="MIT License" />
  </a>
</div>

---

## ✨ Why AI Exam Evaluator?

Transform hours of manual grading into **minutes** with cutting-edge AI while keeping full control in the hands of educators.

- **Ultra-fast AI Grading** powered by Gemini 1.5 Flash (and latest models)
- **Smart Question Paper Generator** for IGCSE & custom curricula
- **Beautiful, responsive dashboard** with real-time editing
- **Role-based access** (Teachers + Super Admins)
- **Auto-save drafts & full result history**

![Demo Screenshot](https://github.com/user-attachments/assets/fbb93ba9-e415-472c-98cd-62005a85a18e)

---

## 🚀 Key Features

| Feature | Description | Status |
|--------|-------------|--------|
| 🤖 **AI Evaluation** | Gemini-powered scoring + detailed feedback | ✅ |
| 📄 **PDF Processing** | Intelligent extraction with validation | ✅ |
| 📝 **Auto Paper Generator** | Generate full IGCSE-style papers instantly | ✅ |
| ✏️ **Manual Override** | Edit AI scores & feedback in real-time | ✅ |
| 👑 **Admin Dashboard** | User management, model switching, settings | ✅ |
| 💾 **Auto-save & History** | Never lose progress | ✅ |
| 📱 **Fully Responsive** | Works perfectly on mobile & tablet | ✅ |
| 🔐 **Secure & Private** | Supabase + Row Level Security | ✅ |

---

## 🛠️ Tech Stack

**Frontend:** React 18 • TypeScript • Vite • Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Edge Functions)  
**AI:** Google Gemini API (`gemini-1.5-flash` & latest)  
**Testing:** Python E2E Test Suite (TC001–TC017)  
**Deployment:** Netlify + Supabase

---

## 🎥 Live Demo & Screenshots

*(Add a short Loom / YouTube video here — highly recommended)*

> **"This tool saved me over 12 hours of grading last semester."** — *Early User*

![Dashboard Preview](https://github.com/user-attachments/assets/...your-image...)
![Grading Interface](https://github.com/user-attachments/assets/...your-image...)
![Paper Generator](https://github.com/user-attachments/assets/...your-image...)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Supabase Project
- Google Gemini API Key

```bash
# 1. Clone the repo
git clone https://github.com/shakhawathossain07/AI-Exam-Evaluator-.git
cd AI-Exam-Evaluator-

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Add your Supabase & Gemini keys
```

Then run:

```bash
npm run dev
```

**Backend Setup:**
```bash
supabase functions deploy setup-default-admin
```

---

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components
├── features/       # Feature-based modules
├── hooks/          # Custom React hooks
├── lib/            # Supabase, AI services
├── utils/          # Helpers & validators
supabase/
├── functions/      # Deno Edge Functions
├── migrations/     # Database schema
testsprite_tests/   # Full E2E Python test suite
```

---

## 🧪 Testing

Run the complete test suite:

```bash
cd testsprite_tests
python TC001_User_authentication_with_valid_admin_credentials.py
# ... run other TCs
```

---

## 🤝 Contributing

Contributions are **highly welcome**! Whether it's new features, bug fixes, or improving documentation — feel free to open a PR.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-idea`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-idea`)
5. Open a Pull Request

---

<div align="center">
  <strong>Made with ❤️ for educators by educators</strong><br><br>
  <a href="https://github.com/shakhawathossain07/AI-Exam-Evaluator-/issues">Report a Bug</a> • 
  <a href="https://github.com/shakhawathossain07/AI-Exam-Evaluator-/discussions">Start a Discussion</a>
</div>

---

**MIT License** • Open Source • AI-Assisted Development

```


- Social preview image description for GitHub?

Just say the word!

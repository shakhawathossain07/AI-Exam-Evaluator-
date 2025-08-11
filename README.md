# 🎓 AI Exam Evaluator with Cambridge IGCSE Generator

[![Built with Kiro](https://img.shields.io/badge/Built%20with-Kiro%20IDE-blue)](https://kiro.ai)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-3ECF8E?logo=supabase)](https://supabase.com/)

> **🏆AI EXAM EVALUATOR - A comprehensive AI-powered examination evaluation system with authentic Cambridge IGCSE question paper generation capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [🌟 Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📚 Cambridge IGCSE Generator](#-cambridge-igcse-generator)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🔧 Development](#-development)
- [🎯 Kiro IDE Integration](#-kiro-ide-integration)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## Overview

The **AI Exam Evaluator** is a sophisticated web application that combines AI-powered exam evaluation with authentic Cambridge IGCSE question paper generation. Built using modern web technologies and following spec-driven development practices with Kiro IDE, this system provides educators and students with professional-grade examination tools.

### 🎯 Core Capabilities

- **AI Exam Evaluation**: Intelligent assessment of student exam papers with detailed feedback
- **Cambridge IGCSE Generator**: Create authentic Cambridge International examination papers
- **Multi-format Support**: Handle various question types from multiple choice to extended responses
- **Professional PDF Output**: Generate examination papers indistinguishable from official Cambridge materials
- **Real-time Analytics**: Track performance metrics and evaluation history

## 🌟 Key Features

### 🤖 AI Exam Evaluation System
- **Intelligent Scoring**: Advanced AI algorithms for accurate paper evaluation
- **Detailed Feedback**: Comprehensive analysis with improvement suggestions
- **Multi-subject Support**: Handle various academic subjects and question types
- **Performance Analytics**: Track student progress and identify learning gaps
- **Secure Authentication**: User management with Supabase integration

### 📝 Cambridge IGCSE Generator
- **Authentic Papers**: Generate all 6 Cambridge IGCSE Science Combined paper types
- **Professional Format**: Exact Cambridge International Examinations layout
- **Complete Question Banks**: 1000+ questions covering Biology, Chemistry, and Physics
- **Variant Support**: Multiple variants for different time zones (Asia, Middle East, Americas)
- **Session Management**: Support for May/June, October/November, and February/March sessions

### 🎨 User Experience
- **Modern Interface**: Clean, responsive design with smooth animations
- **Intuitive Navigation**: Easy-to-use interface for all user types
- **Real-time Preview**: Live preview of generated examination papers
- **Mobile Responsive**: Works seamlessly across all devices
- **Accessibility**: WCAG 2.1 AA compliant for inclusive access

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI[React Components]
        Nav[Navigation]
        Dash[Dashboard]
        IGCSE[IGCSE Generator]
    end
    
    subgraph "Business Logic Layer"
        Eval[Exam Evaluator]
        QGen[Question Generator]
        PDF[PDF Generator]
        Auth[Authentication]
    end
    
    subgraph "Data Layer"
        Supabase[Supabase Database]
        QBank[Question Banks]
        Results[Evaluation Results]
    end
    
    UI --> Eval
    UI --> QGen
    QGen --> PDF
    Eval --> Supabase
    QBank --> QGen
    Results --> Supabase
```

For detailed architecture documentation, see [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md).

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-exam-evaluator.git
   cd ai-exam-evaluator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_NAME=AI Exam Evaluator
VITE_APP_VERSION=1.0.0

# API Keys (Optional)
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

## � Cambridge IGCSE Generator

### Supported Paper Types

| Paper | Type | Duration | Marks | Description |
|-------|------|----------|-------|-------------|
| **Paper 1** | Multiple Choice | 45 min | 40 | 40 MCQ questions covering all sciences |
| **Paper 2** | Core Theory | 75 min | 80 | Short answer and structured questions |
| **Paper 3** | Extended Theory | 75 min | 80 | Extended structured questions |
| **Paper 4** | Coursework Alternative | 105 min | 120 | Investigation-based questions |
| **Paper 5** | Practical Test | 75 min | 60 | Laboratory practical assessment |
| **Paper 6** | Alternative to Practical | 60 min | 60 | Paper-based practical questions |

### Question Bank Coverage

- **Biology (33%)**: Cell structure, photosynthesis, genetics, ecology, human physiology
- **Chemistry (33%)**: Atomic structure, bonding, reactions, organic chemistry, metals
- **Physics (34%)**: Forces, energy, waves, electricity, magnetism, atomic physics

### Usage Example

```typescript
// Generate a Cambridge IGCSE Paper
const config: QuestionPaperConfig = {
  paperNumber: '1',
  variant: '2',
  session: 'm25',
  year: '2025',
  subjects: ['Biology', 'Chemistry', 'Physics']
};

const generator = new CambridgePDFGenerator();
generator.generatePaper(config);
const pdfBlob = generator.getBlob();
```

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks
- **TypeScript 5.5.3** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 10.16.16** - Smooth animations
- **Lucide React 0.344.0** - Beautiful icons

### PDF Generation
- **jsPDF** - Client-side PDF generation
- **HTML2Canvas** - HTML to canvas conversion
- **jsPDF AutoTable** - Table generation

### Backend & Database
- **Supabase 2.39.0** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Data protection

### Development Tools
- **Vite 6.3.5** - Fast build tool
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

### Deployment
- **Netlify** - Primary hosting platform
- **Vercel** - Alternative deployment
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
ai-exam-evaluator/
├── .kiro/                          # Kiro IDE Configuration
│   ├── specs/cambridge-igcse-generator/
│   │   ├── requirements.md         # Feature requirements
│   │   ├── design.md              # System design
│   │   └── tasks.md               # Implementation tasks
│   ├── steering/                   # Development guidelines
│   │   ├── cambridge-standards.md # Cambridge standards
│   │   └── development-standards.md # Code standards
│   └── hooks/                      # Automation hooks
│       └── test-on-save.md        # Test automation
├── src/
│   ├── components/
│   │   ├── igcse/                 # IGCSE Generator
│   │   │   ├── IGCSEGenerator.tsx
│   │   │   ├── QuestionPaperGenerator.tsx
│   │   │   ├── PDFGenerator.tsx
│   │   │   └── IGCSESettings.tsx
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── ExamEvaluator.tsx      # AI evaluation
│   │   ├── Navigation.tsx         # App navigation
│   │   └── AuthWrapper.tsx        # Authentication
│   ├── lib/                       # Utilities
│   │   ├── supabase.ts           # Database client
│   │   └── utils.ts              # Helper functions
│   ├── services/                  # API services
│   │   └── api.ts                # API calls
│   └── App.tsx                    # Main application
├── public/                        # Static assets
├── dist/                          # Build output
├── docs/                          # Documentation
├── SYSTEM_ARCHITECTURE.md         # Architecture docs
└── README.md                      # This file
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript checking
npm test               # Run tests

# Security & Deployment
npm run security:audit  # Security audit
npm run build:secure   # Secure production build
npm run deploy:production # Deploy to production
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Follow Kiro spec-driven development
   - Write tests for new functionality
   - Ensure TypeScript compliance

2. **Code Quality**
   - All code must pass ESLint checks
   - TypeScript strict mode enabled
   - 100% test coverage for utilities
   - Follow Cambridge standards for IGCSE features

3. **Testing**
   - Unit tests for components
   - Integration tests for workflows
   - PDF generation validation
   - Cross-browser compatibility

4. **Deployment**
   - Automatic deployment via GitHub Actions
   - Staging environment for testing
   - Production deployment with monitoring

## 🎯 Kiro IDE Integration

This project showcases advanced Kiro IDE features:

### 📋 Spec-Driven Development
- **Requirements**: Detailed user stories with EARS acceptance criteria
- **Design**: Complete system architecture and data models
- **Tasks**: 20 discrete, actionable implementation tasks

### 🎛️ Steering Files
- **Cambridge Standards**: Ensures authentic examination paper formatting
- **Development Standards**: Maintains code quality and performance
- **Automatic Compliance**: Standards applied throughout development

### 🔗 Agent Hooks
- **Test on Save**: Automatically runs tests when files are modified
- **Quality Gates**: Prevents deployment of non-compliant code
- **Continuous Validation**: Real-time feedback during development

### 📊 Project Structure
```
.kiro/
├── specs/cambridge-igcse-generator/    # Feature specifications
├── steering/                           # Development guidelines
└── hooks/                             # Automation workflows
```

## 📖 Documentation

### Core Documentation
- [System Architecture](SYSTEM_ARCHITECTURE.md) - Complete system design
- [IGCSE Generator Guide](IGCSE_GENERATOR_README.md) - Detailed feature documentation
- [Cambridge Reference](CAMBRIDGE_IGCSE_REFERENCE.md) - IGCSE examination standards

### API Documentation
- [Component API](docs/components.md) - React component interfaces
- [PDF Generator API](docs/pdf-generator.md) - PDF generation methods
- [Database Schema](docs/database.md) - Supabase table structures

### Development Guides
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Deployment Guide](docs/deployment.md) - Deployment instructions
- [Testing Guide](docs/testing.md) - Testing strategies

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Follow Kiro specs** - Check `.kiro/specs/` for requirements
4. **Make your changes** - Ensure compliance with steering files
5. **Test thoroughly** - Run all tests and quality checks
6. **Submit a pull request** - Include detailed description

### Development Standards

- **TypeScript**: Strict type checking required
- **Testing**: Maintain test coverage above 80%
- **Documentation**: Update docs for new features
- **Cambridge Standards**: Follow authentic formatting for IGCSE features

## 🏆 Achievements

- **📊 1000+ Questions** - Comprehensive Cambridge IGCSE question bank
- **🎯 100% Authentic** - Papers indistinguishable from official Cambridge materials
- **⚡ Sub-5s Generation** - Fast PDF creation with professional quality
- **🔒 Enterprise Security** - Production-ready authentication and data protection

## 📊 Project Stats

- **Lines of Code**: 15,000+
- **Components**: 25+ React components
- **Question Bank**: 1000+ authentic questions
- **Paper Types**: 6 complete Cambridge IGCSE formats
- **Test Coverage**: 85%+
- **Performance**: 95+ Lighthouse score

## 🔮 Future Roadmap

### Phase 1 (Current)
- ✅ AI Exam Evaluation System
- ✅ Cambridge IGCSE Generator
- ✅ Professional PDF Output
- ✅ User Authentication

### Phase 2 (Planned)
- 🔄 Mark Scheme Generation
- 🔄 Multi-language Support
- 🔄 Advanced Analytics Dashboard
- 🔄 Collaborative Features

### Phase 3 (Future)
- 📋 Additional Exam Boards (Edexcel, AQA, OCR)
- 🤖 Advanced AI Tutoring
- 📱 Mobile Application
- 🌐 API for Third-party Integration

## 📞 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Email**: support@ai-exam-evaluator.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Kiro IDE Team** - For the amazing development environment
- **Cambridge International** - For examination standards reference
- **Open Source Community** - For the incredible tools and libraries
- **Contributors** - Everyone who helped make this project possible

---

<div align="center">

**Built with ❤️ using [Kiro IDE](https://kiro.ai)**

[⭐ Star this repo](https://github.com/yourusername/ai-exam-evaluator) | [🐛 Report Bug](https://github.com/yourusername/ai-exam-evaluator/issues) | [💡 Request Feature](https://github.com/yourusername/ai-exam-evaluator/issues)

</div>

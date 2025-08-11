# 🎓 Cambridge IGCSE Generator

<div align="center">

![Cambridge IGCSE Generator](https://img.shields.io/badge/Cambridge-IGCSE%20Generator-blue?style=for-the-badge&logo=graduation-cap)
![Built with Kiro](https://img.shi
## ✨ Features

- **AI-Powered Evaluation**: Uses Google's Gemini AI model for intelligent exam paper assessment
- **Multiple Exam Types**: Supports IELTS, O-Level, A-Level, and standard grading systems
- **PDF Processing**: Advanced PDF parsing and page-by-page analysis
- **Real-time Preview**: Interactive evaluation review with editing capabilities
- **Secure Authentication**: Role-based access control with admin panel
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **AI Integration**: Google Gemini AI API
- **PDF Processing**: PDF.js
- **Deployment**: Vercel, Netlify

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google AI API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-exam-evaluator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Deploy the edge functions in `supabase/functions`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### AI Configuration

The application uses Google's Gemini AI model. Configure your API key in the application settings or through the admin panel.

## 📖 Usage

### For Students/Teachers

1. **Upload Files**: Upload student exam papers and marking schemes (PDF format)
2. **Set Parameters**: Configure total marks, exam type, and student information
3. **AI Evaluation**: Let the AI analyze and evaluate the papers
4. **Review Results**: Review and edit the evaluation results if needed
5. **Save/Export**: Save the evaluation for records or export reports

### For Administrators

1. **Access Admin Panel**: Use admin credentials to access the administrative interface
2. **Manage Users**: Control user access and evaluation limits
3. **Monitor System**: Track evaluation usage and system performance
4. **Configure Settings**: Adjust AI models, evaluation parameters, and system settings

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Library configurations
├── services/           # API services and business logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles

supabase/
├── functions/          # Edge functions
└── migrations/         # Database migrations

public/                 # Static assets
scripts/               # Build and deployment scripts
```

## 🔐 Security Features

- **Secure Authentication**: Multi-factor authentication with Supabase
- **Role-based Access**: Different permission levels for users and admins
- **Data Encryption**: All sensitive data is encrypted
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive validation of all inputs

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm run deploy:vercel
```

### Deploy to Netlify

```bash
npm run deploy:netlify
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Md. Shakhawat Hossain** - Lead Developer
- **Dr. Nabeel Mohammed** - Supervisor & Associate Professor
- **Ashikul Bari Chowdhury** - Contributor

**Department of Electrical and Computer Engineering**  
**North South University**

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

We welcome feature requests! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Any relevant examples or mockups

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**🎉 Thank you for using AI Exam Evaluator!**

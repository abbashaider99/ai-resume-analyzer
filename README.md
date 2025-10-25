# Abbas Logic

A collection of powerful AI-powered tools designed to boost productivity and help you achieve more.

## 🚀 Tools

### HireLens - AI Resume Analyzer
AI-powered resume analyzer that helps you optimize your resume for ATS systems and get hired faster.

**Features:**
- 📄 Upload and analyze resumes (PDF format)
- 🤖 AI-powered feedback on ATS compatibility
- 📊 Detailed scoring across multiple categories:
  - Overall Score
  - ATS Compatibility
  - Tone & Style
  - Content Quality
  - Structure
  - Skills Assessment
- 💡 Actionable tips and suggestions
- 🔒 Privacy-focused (uses Puter.js cloud storage)

**Access:** `/hirelens`

---

## 🛠️ Tech Stack

- **Frontend:** React 19 with React Router v7
- **Styling:** Tailwind CSS v4
- **Build Tool:** Vite 6
- **Language:** TypeScript 5
- **State Management:** Zustand
- **Cloud Platform:** Puter.js (Auth, Storage, AI, KV Store)
- **PDF Processing:** pdfjs-dist
- **File Upload:** react-dropzone

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Development

```bash
# Type checking
npm run typecheck

# Build for production
npm run build
```

## 📁 Project Structure

```
app/
├── routes/
│   ├── index.tsx              # Abbas Logic homepage
│   ├── contact.tsx            # Contact page
│   ├── wipe.tsx              # Data wipe utility
│   └── hirelens/             # HireLens tool routes
│       ├── index.tsx         # HireLens homepage
│       ├── auth.tsx          # Authentication
│       ├── upload.tsx        # Resume upload
│       └── resume.tsx        # Resume analysis view
├── components/               # Reusable components
├── lib/                      # Utilities and services
├── assets/                   # Static assets
└── app.css                  # Global styles

constants/                    # Constants and configs
types/                       # TypeScript type definitions
public/                      # Public assets
```

## 🌐 Routes

- `/` - Abbas Logic homepage (tool directory)
- `/hirelens` - HireLens AI Resume Analyzer
- `/hirelens/upload` - Upload resume for analysis
- `/hirelens/resume/:id` - View resume analysis
- `/hirelens/auth` - Authentication
- `/contact` - Contact page

## 🔐 Authentication

This project uses Puter.js for authentication and cloud storage. Users need to sign in to:
- Upload and analyze resumes
- View past resume analyses
- Access saved data

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t abbaslogic .

# Run container
docker run -p 3000:3000 abbaslogic
```

## 📝 Environment

No environment variables required - uses Puter.js cloud platform.

## 🤝 Contributing

This is a personal project showcase. Feel free to fork and adapt for your own use!

## 📄 License

All rights reserved © 2025 Abbas Logic

---

**Built with ❤️ by Abbas Haider**

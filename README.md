# 🚀 AI Resume Parser & Suggestions Generator

[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini-blue.svg)](https://ai.google.dev/)

> **Transform your resume with AI-powered analysis and professional suggestions**

An intelligent web application that parses resume files and provides personalized improvement suggestions using Google's Gemini AI. Built with vanilla JavaScript and Node.js for simplicity and performance.

# Demo Screenshot

<img width="1908" height="1011" alt="image" src="https://github.com/user-attachments/assets/bc1d68ef-5e2a-4dbc-9e1e-25448071d816" />


## ✨ Features

- 📄 **Multi-format Support**: Upload PDF, DOC, DOCX, or TXT files
- 🤖 **AI-Powered Analysis**: Get intelligent suggestions from Google Gemini AI
- 🎯 **ATS Optimization**: Improve your resume for Applicant Tracking Systems
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🖱️ **Drag & Drop**: Modern file upload experience
- ⚡ **Real-time Processing**: Fast text extraction and analysis
- 🎨 **Modern UI**: Beautiful glassmorphism design with smooth animations

## 🎯 What You'll Get

- **Content & Structure Analysis**: Improve overall resume organization
- **Skills & Keywords Suggestions**: Add relevant industry-specific keywords
- **Experience Enhancement**: Better ways to describe your achievements
- **ATS Score Optimization**: Make your resume more discoverable
- **Missing Sections Detection**: Identify important sections you might have missed
- **Industry-Specific Advice**: Tailored recommendations for your field

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
  git clone https://github.com/pranav-abhyankar/ai-powered-resume-parser.git          
  cd ai-powered-resume-parser

3. **Configure your API key**
  # Open server.js and replace the API key
  const GEMINI_API_KEY = 'your_actual_gemini_api_key_here';

3. **Start the backend server**
  node server.js
  
4. **Open the frontend**
  # Open index.html in your web browser
  # Or serve it with a simple HTTP server:
  python -m http.server 8080  # Python 3
  # or
  npx serve .  # Using npx

5. **Access the application**
  - Frontend: `http://localhost:8080` (if using HTTP server)
  - Backend API: `http://localhost:3000`

## 📖 Usage

1. **Upload Your Resume**
  - Drag and drop your resume file onto the upload area
  - Or click to browse and select your file
  - Supported formats: PDF, DOC, DOCX, TXT

2. **Get AI Analysis**
  - Click "Parse Resume & Generate Suggestions"
  - Wait for the AI to process your resume (usually 5-10 seconds)

3. **Review Results**
  - View your parsed resume content on the left
  - Get personalized AI suggestions on the right
  - Implement the recommendations to improve your resume

## 🏗️ Project Structure

ai-resume-parser/                                   
├── index.html             # Frontend interface            
├── styles.css             # Modern UI styling                    
├── server.js              # Backend API server                          
├── README.md              # This file                         
└── package.json           # Dependencies (optional)                       

## 🔧 Configuration

### Environment Variables

# Optional: Change the server port
PORT=3001

# Required: Your Gemini API key
GEMINI_API_KEY=your_api_key_here

### API Endpoints

- `POST /api/parse-resume` - Parse resume and generate suggestions
- `GET /api/health` - Check server health status

## 🖥️ Technical Details

### Frontend Stack
- **HTML5**: Semantic markup with modern features
- **CSS3**: Flexbox/Grid, animations, glassmorphism design
- **Vanilla JavaScript**: File handling, API communication, DOM manipulation

### Backend Stack
- **Node.js**: Pure Node.js HTTP server (no frameworks)
- **Google Gemini AI**: Advanced language model for content analysis
- **File Processing**: Custom text extraction for multiple formats

### File Processing Support

| Format | Support Level | Notes |
|--------|--------------|-------|
| TXT    | ✅ Excellent  | Best results, direct text reading |
| PDF    | ⚠️ Basic      | Regex-based extraction, may vary by PDF type |
| DOC    | ⚠️ Limited    | Binary parsing, older format support |
| DOCX   | ⚠️ Limited    | Basic text extraction |

## 🎨 UI Features

- **Glassmorphism Design**: Modern semi-transparent aesthetic
- **Responsive Layout**: Adapts to any screen size
- **Smooth Animations**: Loading spinners and hover effects
- **Drag & Drop**: Intuitive file upload experience
- **Error Handling**: User-friendly error messages


## 🔍 How It Works

1. **File Upload**: User selects/drops a resume file
2. **Text Extraction**: Server extracts text based on file type
3. **Content Parsing**: Resume sections are identified and structured
4. **AI Analysis**: Gemini AI analyzes content and generates suggestions
5. **Results Display**: Parsed content and suggestions shown to user



## 🚧 Troubleshooting

### Common Issues

**Server won't start on port 3000:**

# Check if port is in use
lsof -ti:3000 | xargs kill  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Or use different port
PORT=3001 node server.js

**PDF text extraction is poor:**
- Try converting PDF to TXT format
- Copy-paste content into a TXT file
- Some PDFs have complex layouts that are hard to parse

**API errors:**
- Verify your Gemini API key is correct
- Check your internet connection
- Ensure you haven't exceeded API rate limits



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the intelligent suggestions
- The open-source community for inspiration and best practices


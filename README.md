# 🎓 AI Feedback Analyzer

A modern full-stack web application for analyzing student feedback using AI-powered sentiment analysis and generating actionable recommendations with Google Gemini.

## ✨ Features

- **📊 Sentiment Analysis**: Analyze reviews using state-of-the-art NLP models (Transformers.js)
- **🤖 AI Recommendations**: Generate actionable insights using Google Gemini AI
- **📈 Visual Analytics**: Interactive pie charts showing sentiment distribution
- **🎨 Modern UI**: Beautiful, responsive React interface with smooth animations
- **🔒 Secure API**: Backend API keeps your Gemini API key safe
- **📥 Drag & Drop**: Easy CSV file upload with drag-and-drop support
- **⬇️ Export Results**: Download sentiment analysis results and AI recommendations

## 🏗️ Architecture

### Frontend (React)
- **React 18** with Hooks
- **Chart.js** for data visualization
- **Axios** for API requests
- **React Dropzone** for file uploads
- **React Markdown** for formatted AI recommendations

### Backend (Node.js)
- **Express.js** API server
- **Transformers.js** for sentiment analysis (runs locally)
- **Google Gemini API** for AI-powered recommendations
- **Multer** for file handling
- **PapaParse** for CSV parsing

## 📁 Project Structure

```
AI_Feedback_Analyzer/
├── backend/
│   ├── services/
│   │   ├── sentimentService.js    # Sentiment analysis logic
│   │   └── geminiService.js       # Gemini AI integration
│   ├── server.js                   # Express API server
│   ├── package.json
│   ├── .env.example
│   └── .env                        # Your API keys (create this)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js      # CSV upload component
│   │   │   ├── SentimentResults.js # Results display
│   │   │   └── AIRecommendations.js # AI insights
│   │   ├── App.js                  # Main app component
│   │   └── index.js
│   └── package.json
├── README.md
└── [old Python files - can be archived]
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## 🚀 Installation

### 1. Clone or navigate to the project directory

```bash
cd AI_Feedback_Analyzer
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from template
copy .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install
```

## 🎯 Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: `http://localhost:3000`

### Option 2: Development Mode (Recommended)

**Backend with auto-reload:**
```bash
cd backend
npm run dev
```

**Frontend (in another terminal):**
```bash
cd frontend
npm start
```

## 📁 CSV File Format

Your CSV file must contain a column named **"review"** (case-insensitive: review, Review, REVIEW, etc.)

**Example:**
```csv
review
"The teaching quality is excellent and the campus is beautiful."
"Poor infrastructure and unresponsive administration."
"Great learning environment with helpful faculty."
```

## 🔧 Configuration

### Backend Environment Variables (`backend/.env`)

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Proxy

The frontend is configured to proxy API requests to `http://localhost:5000` (see `frontend/package.json`)

## 🎨 Features in Detail

### 1. File Upload
- Drag & drop interface
- CSV validation
- Case-insensitive column detection
- Real-time upload progress

### 2. Sentiment Analysis
- Analyzes each review for sentiment (Positive/Neutral/Negative)
- Provides confidence scores
- Interactive pie chart visualization
- Export results to CSV

### 3. AI Recommendations
- Processes negative reviews in batches
- Identifies key issues and themes
- Provides actionable recommendations
- Generates comprehensive reports
- Export recommendations to text file

## 🔄 API Endpoints

### `POST /api/analyze`
Upload and analyze a CSV file
- **Body**: FormData with `file` field
- **Returns**: Sentiment analysis results

### `POST /api/recommendations`
Generate AI recommendations for negative reviews
- **Body**: JSON with `negativeReviews`, `maxReviews`, `chunkSize`
- **Returns**: AI-generated recommendations

### `GET /api/health`
Health check endpoint
- **Returns**: `{ status: 'OK', message: 'Server is running' }`

## 🛠️ Tech Stack

### Frontend
- React 18
- Chart.js & react-chartjs-2
- Axios
- React Dropzone
- React Markdown

### Backend
- Node.js
- Express.js
- @xenova/transformers (Transformers.js)
- @google/generative-ai (Gemini)
- Multer
- PapaParse

## 🐛 Troubleshooting

### Backend not starting
- Ensure Node.js v16+ is installed
- Check if port 5000 is available
- Verify `.env` file exists with valid `GEMINI_API_KEY`

### Frontend not connecting to backend
- Ensure backend is running on port 5000
- Check console for CORS errors
- Verify proxy setting in `frontend/package.json`

### Sentiment analysis slow
- First model load takes ~10-30 seconds
- Subsequent analyses are faster (model is cached)
- Consider processing smaller batches

### Gemini API errors
- Verify API key is correct
- Check API quota/limits
- Review error messages in backend console

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `AI_Feedback_Analyzer`

3. **Configure Deployment**
   - **Name**: `ai-feedback-analyzer` (or your preferred name)
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.` (root directory)
   - **Plan**: Starter (or higher for better performance)

4. **Set Environment Variables**
   - Click "Environment" tab
   - Add: `GEMINI_API_KEY` = `your_actual_api_key_here`
   - Add: `NODE_ENV` = `production` (optional, already in render.yaml)

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - First deployment takes ~5-10 minutes (model download)
   - You'll get a URL like: `https://ai-feedback-analyzer.onrender.com`

6. **Health Check**
   - Render automatically checks `/api/health` endpoint
   - Service will be marked healthy when ready

### Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy**
   ```bash
   railway init
   railway up
   ```

3. **Set Environment Variable**
   ```bash
   railway variables set GEMINI_API_KEY=your_key_here
   ```

### Deploy with Docker (Local/Any Platform)

1. **Build the image**
   ```bash
   docker build -t ai-feedback-analyzer:latest .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 -e GEMINI_API_KEY=your_key ai-feedback-analyzer:latest
   ```

3. **Access the app**
   - Open: `http://localhost:5000`

### Environment Variables for Production

Required:
- `GEMINI_API_KEY`: Your Google Gemini API key

Optional:
- `PORT`: Server port (defaults to 5000, Render sets this automatically)
- `NODE_ENV`: Set to `production` for optimizations

## 📝 License

MIT License - Feel free to use this project for your needs!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Support

For issues or questions, please check:
- Backend logs: Terminal running backend server (or Render logs)
- Frontend logs: Browser console (F12)
- Network tab: Check API request/response

---

**Made with ❤️ using React, Node.js, Transformers.js, and Google Gemini**

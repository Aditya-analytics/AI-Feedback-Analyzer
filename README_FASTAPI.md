# AI Feedback Analyzer - FastAPI Backend

🎓 **Student feedback analysis with Python FastAPI, HuggingFace Transformers, and Google Gemini AI**

## 🚀 New Features

- ✅ **FastAPI Backend** (Python) - Much faster and better for ML models
- ✅ **HuggingFace Transformers** - RoBERTa sentiment analysis model
- ✅ **Google Gemini AI** - Advanced recommendations
- ✅ **GPU Support** - Automatic CUDA detection for faster inference
- ✅ **React Frontend** - Modern, responsive UI

---

## 📋 Prerequisites

- Python 3.8+ (with pip)
- Node.js 16+ (with npm)
- Optional: CUDA-compatible GPU for faster processing

---

## 🛠️ Setup Instructions

### 1️⃣ Install Python Dependencies

```bash
cd AI_Feedback_Analyzer
pip install -r requirements.txt
```

### 2️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

---

## 🏃 Running the Application

### Option 1: Run both servers manually

**Terminal 1 - Backend (FastAPI):**
```bash
cd AI_Feedback_Analyzer
python api_server.py
```

**Terminal 2 - Frontend (React):**
```bash
cd frontend
npm start
```

### Option 2: Use PowerShell script (Windows)

```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd AI_Feedback_Analyzer; python api_server.py"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd AI_Feedback_Analyzer/frontend; npm start"
```

---

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/docs (FastAPI auto-generated)

---

## 📊 How It Works

### 1. **Upload CSV File**
   - Must contain a `review` column (case-insensitive)
   - One review per row

### 2. **Sentiment Analysis**
   - Uses **RoBERTa transformer model** from HuggingFace
   - Classifies: Positive, Negative, Neutral
   - Returns confidence scores

### 3. **AI Recommendations**
   - Analyzes negative reviews using **Google Gemini**
   - Generates actionable insights
   - Provides prioritized recommendations

---

## 🔧 API Endpoints

### `GET /`
Health check and API information

### `GET /api/health`
Server status check

### `POST /api/analyze`
Upload CSV and perform sentiment analysis

**Request:**
- Form data with `file` field (CSV)

**Response:**
```json
{
  "success": true,
  "totalReviews": 100,
  "results": [
    {
      "originalReview": "...",
      "cleanedText": "...",
      "sentiment": "positive",
      "confidence": 0.95
    }
  ]
}
```

### `POST /api/recommendations`
Generate AI recommendations

**Request:**
```json
{
  "negativeReviews": ["review1", "review2"],
  "maxReviews": 100,
  "chunkSize": 50,
  "apiKey": "optional_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "analyzedCount": 50,
  "recommendations": "markdown formatted recommendations..."
}
```

---

## 🎯 Model Details

### Sentiment Analysis
- **Model**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Architecture**: RoBERTa (Transformer-based)
- **Task**: Text classification (3 classes: positive, negative, neutral)
- **Performance**: State-of-the-art accuracy on sentiment tasks

### AI Recommendations
- **Model**: Google Gemini 2.0 Flash
- **Task**: Text generation and analysis
- **Features**: Contextual understanding, actionable insights

---

## 🐛 Troubleshooting

### Model Download Issues
Models are downloaded automatically on first run. If you have issues:
```bash
python -c "from transformers import pipeline; pipeline('sentiment-analysis', model='cardiffnlp/twitter-roberta-base-sentiment-latest')"
```

### CUDA/GPU Not Detected
Check if PyTorch detects your GPU:
```bash
python -c "import torch; print(torch.cuda.is_available())"
```

### Port Already in Use
Change the port in `api_server.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=5001, log_level="info")
```

And update `frontend/package.json`:
```json
"proxy": "http://localhost:5001"
```

---

## 📈 Performance Tips

1. **GPU Acceleration**: Use CUDA-compatible GPU for 10-50x faster inference
2. **Batch Processing**: Larger CSV files are processed in batches
3. **Model Caching**: Models are loaded once and cached in memory
4. **Rate Limiting**: Gemini API calls are rate-limited to avoid quota issues

---

## 🔐 Security Notes

- Never commit `.env` file with real API keys
- Use environment variables for sensitive data
- Validate all file uploads
- Sanitize user inputs

---

## 📝 Example CSV Format

```csv
review
The teaching quality is excellent and the campus is beautiful.
Poor infrastructure and unresponsive administration.
Great learning environment with helpful faculty.
```

---

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

## 📄 License

MIT License

---

**Made with ❤️ using FastAPI, React, Transformers, and Google Gemini**

"""
FastAPI Backend for AI Feedback Analyzer
Uses HuggingFace transformers for sentiment analysis and Google Gemini for recommendations
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io
import re
import torch
from transformers import pipeline
from google import genai
import os
from dotenv import load_dotenv
import math
import time

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Feedback Analyzer API",
    description="Sentiment analysis and AI recommendations for student feedback",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
sentiment_pipeline = None
device = 0 if torch.cuda.is_available() else -1

# ============================================
# Models
# ============================================

class RecommendationRequest(BaseModel):
    negativeReviews: List[str]
    maxReviews: Optional[int] = 100
    chunkSize: Optional[int] = 50
    apiKey: Optional[str] = None

class SentimentResult(BaseModel):
    originalReview: str
    cleanedText: str
    sentiment: str
    confidence: float

class AnalysisResponse(BaseModel):
    success: bool
    totalReviews: int
    results: List[dict]

# ============================================
# Utility Functions
# ============================================

def preprocess_text(text: str) -> str:
    """Clean and preprocess review text"""
    try:
        text = str(text).lower()
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)
        # Remove mentions and hashtags
        text = re.sub(r'@\w+|#\w+', '', text)
        # Remove special characters and numbers
        text = re.sub(r'[^a-z\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception as e:
        print(f"Preprocessing error: {e}")
        return ""

def load_sentiment_model():
    """Load sentiment analysis model with caching"""
    global sentiment_pipeline
    if sentiment_pipeline is None:
        print("🔄 Loading sentiment analysis model...")
        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=device,
            truncation=True,
            max_length=512
        )
        print("✅ Sentiment model loaded")
    return sentiment_pipeline

# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Feedback Analyzer API - Python/FastAPI",
        "version": "2.0.0",
        "endpoints": {
            "health": "/api/health",
            "analyze": "POST /api/analyze",
            "recommendations": "POST /api/recommendations"
        },
        "ml_backend": "HuggingFace Transformers (RoBERTa)",
        "device": "GPU (CUDA)" if device == 0 else "CPU"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "message": "FastAPI server is running",
        "device": "GPU (CUDA)" if device == 0 else "CPU"
    }

@app.post("/api/analyze")
async def analyze_reviews(file: UploadFile = File(...)):
    """
    Upload and analyze CSV file with reviews
    Performs sentiment analysis using transformer model
    """
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Find review column (case-insensitive)
        review_column = None
        for col in df.columns:
            if col.lower() == 'review':
                review_column = col
                break
        
        if review_column is None:
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain a 'review' column. Available columns: {', '.join(df.columns)}"
            )
        
        # Extract reviews
        reviews = df[review_column].dropna().tolist()
        reviews = [r for r in reviews if str(r).strip() != '']
        
        if len(reviews) == 0:
            raise HTTPException(status_code=400, detail="No valid reviews found in CSV")
        
        # Load model
        pipe = load_sentiment_model()
        
        # Analyze reviews
        results = []
        print(f"Analyzing {len(reviews)} reviews...")
        
        for review in reviews:
            cleaned = preprocess_text(review)
            
            if not cleaned or len(cleaned) == 0:
                continue
            
            try:
                # Truncate to 512 characters
                truncated = cleaned[:512]
                sentiment_result = pipe(truncated)[0]
                
                results.append({
                    "originalReview": review,
                    "cleanedText": cleaned,
                    "sentiment": sentiment_result["label"].lower(),
                    "confidence": round(sentiment_result["score"], 3)
                })
            except Exception as e:
                print(f"Error analyzing review: {e}")
                continue
        
        print(f"✅ Successfully analyzed {len(results)} reviews")
        
        return {
            "success": True,
            "totalReviews": len(results),
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_reviews: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze reviews: {str(e)}")

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """
    Generate AI recommendations for negative reviews using Gemini
    """
    try:
        negative_reviews = request.negativeReviews
        max_reviews = request.maxReviews
        chunk_size = request.chunkSize
        api_key = request.apiKey or os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="Gemini API key required. Provide in request or set GEMINI_API_KEY environment variable"
            )
        
        if not negative_reviews or len(negative_reviews) == 0:
            return {
                "success": True,
                "message": "No negative reviews to analyze",
                "recommendations": "All reviews are positive! Keep up the great work! 🎉"
            }
        
        # Limit reviews
        reviews_to_analyze = negative_reviews[:max_reviews]
        
        print(f"Generating recommendations for {len(reviews_to_analyze)} negative reviews...")
        
        # Initialize Gemini
        client = genai.Client(api_key=api_key)
        model = "gemini-2.0-flash-exp"
        
        # Split into chunks
        num_chunks = math.ceil(len(reviews_to_analyze) / chunk_size)
        batch_results = []
        
        for i in range(num_chunks):
            start_idx = i * chunk_size
            end_idx = min((i + 1) * chunk_size, len(reviews_to_analyze))
            chunk = reviews_to_analyze[start_idx:end_idx]
            
            print(f"Processing chunk {i + 1}/{num_chunks}...")
            
            prompt = f"""
You are an educational consultant analyzing student feedback. Below are {len(chunk)} negative reviews from students:

{chr(10).join([f"{idx + 1}. {review}" for idx, review in enumerate(chunk)])}

Please provide:
1. **Key Issues Identified**: Summarize the main problems mentioned
2. **Common Themes**: What patterns do you see across these reviews?
3. **Priority Areas**: What should be addressed first?
4. **Specific Recommendations**: Actionable steps to improve

Keep your analysis concise and actionable.
"""
            
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt
                )
                batch_results.append(response.text)
            except Exception as e:
                print(f"Error processing chunk {i + 1}: {e}")
                batch_results.append(f"Error processing batch {i + 1}: {str(e)}")
            
            # Rate limiting
            if i < num_chunks - 1:
                time.sleep(1)
        
        # Generate final summary
        final_prompt = f"""
Based on the following analyses of student feedback batches, provide a comprehensive summary with actionable recommendations:

{chr(10).join([f"### Batch {idx + 1} Analysis:{chr(10)}{result}" for idx, result in enumerate(batch_results)])}

Please provide:
1. **Overall Summary**: What are the most critical issues?
2. **Top 5 Recommendations**: Prioritized, actionable steps
3. **Quick Wins**: Easy improvements that can be implemented immediately
4. **Long-term Strategy**: Structural changes for sustained improvement

Format your response in clear markdown.
"""
        
        try:
            final_response = client.models.generate_content(
                model=model,
                contents=final_prompt
            )
            recommendations = final_response.text
        except Exception as e:
            print(f"Error generating final summary: {e}")
            recommendations = "\n\n---\n\n".join(batch_results)
        
        return {
            "success": True,
            "analyzedCount": len(reviews_to_analyze),
            "recommendations": recommendations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

# ============================================
# Run Server
# ============================================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI server...")
    print(f"📊 Using: {'GPU (CUDA)' if device == 0 else 'CPU'}")
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")

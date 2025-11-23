"""
Gemini API Module for AI Feedback Analyzer
Handles all Gemini API interactions with error handling and retry logic
"""

import time
import math
from typing import List, Dict, Optional
from google import genai


class GeminiAnalyzer:
    """Handles Gemini API operations for feedback analysis"""
    
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        """
        Initialize Gemini client
        
        Args:
            api_key: Gemini API key
            model: Model to use (default: gemini-2.5-flash)
        """
        self.client = genai.Client(api_key=api_key)
        self.model = model
        
    def safe_generate(self, prompt: str, retries: int = 3, delay: int = 5, backoff: float = 1.5) -> str:
        """
        Generate content with retry logic and exponential backoff
        
        Args:
            prompt: The prompt to send to Gemini
            retries: Number of retry attempts
            delay: Initial delay between retries (seconds)
            backoff: Backoff multiplier for exponential delay
            
        Returns:
            Generated text or error message
        """
        for attempt in range(retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt
                )
                if response and hasattr(response, 'text'):
                    return response.text
                return str(response)
            except Exception as e:
                if attempt < retries - 1:
                    wait_time = delay * (backoff ** attempt)
                    print(f"⚠️ Attempt {attempt + 1}/{retries} failed: {e}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    return f"⚠️ Error after {retries} attempts: {str(e)}"
        
        return "⚠️ No response after multiple retries."
    
    def analyze_feedback_batch(self, reviews: List[str], batch_num: int = 1) -> str:
        """
        Analyze a batch of reviews and generate recommendations
        
        Args:
            reviews: List of review texts
            batch_num: Batch number for tracking
            
        Returns:
            Analysis summary
        """
        batch_text = " ".join(reviews)
        
        prompt = f"""
You are an expert education feedback analyst and consultant.

The following reviews are written by students sharing their concerns about an educational institute.

Analyze these reviews and provide:

1. **Top 3 Recurring Student Complaints**
   - List the most common issues with brief descriptions

2. **3 Actionable Recommendations for Administration**
   - Provide specific, implementable solutions

3. **2 Ideas to Improve Student Satisfaction**
   - Suggest innovative approaches to enhance student experience

Keep the response structured, clear, and actionable.

Reviews:
{batch_text}
"""
        
        return self.safe_generate(prompt)
    
    def analyze_reviews(self, reviews: List[str], chunk_size: int = 50, progress_callback=None) -> List[Dict[str, str]]:
        """
        Analyze multiple reviews in chunks
        
        Args:
            reviews: List of all reviews to analyze
            chunk_size: Number of reviews per batch
            progress_callback: Optional callback function for progress updates
            
        Returns:
            List of analysis results with batch numbers and suggestions
        """
        num_chunks = math.ceil(len(reviews) / chunk_size)
        results = []
        
        for i in range(num_chunks):
            batch = reviews[i * chunk_size:(i + 1) * chunk_size]
            
            if progress_callback:
                progress_callback(i + 1, num_chunks)
            
            analysis = self.analyze_feedback_batch(batch, i + 1)
            results.append({
                "batch": i + 1,
                "num_reviews": len(batch),
                "analysis": analysis
            })
            
            # Rate limiting
            if i < num_chunks - 1:
                time.sleep(2)
        
        return results
    
    def generate_summary(self, analyses: List[Dict[str, str]]) -> str:
        """
        Generate a combined summary from multiple batch analyses
        
        Args:
            analyses: List of analysis results
            
        Returns:
            Formatted summary text
        """
        if not analyses:
            return "No analyses available."
        
        summary_parts = []
        for result in analyses:
            batch_num = result.get("batch", "?")
            num_reviews = result.get("num_reviews", 0)
            analysis = result.get("analysis", "")
            
            summary_parts.append(f"### 📊 Batch {batch_num} ({num_reviews} reviews)\n\n{analysis}\n")
        
        return "\n---\n\n".join(summary_parts)

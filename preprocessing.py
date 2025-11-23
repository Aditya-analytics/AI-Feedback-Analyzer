"""
AI Feedback Analyzer - Batch Processing Script
Sentiment Analysis + Preprocessing + Separation
Supports large datasets (10k+ reviews)
"""

import pandas as pd
import re
import torch
import nltk
from nltk.corpus import stopwords
from transformers import pipeline
from tqdm import tqdm
import argparse
import sys
from pathlib import Path

# -----------------------------
# NLTK Setup
# -----------------------------
def setup_nltk():
    """Download required NLTK data"""
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        print("Downloading punkt tokenizer...")
        nltk.download("punkt", quiet=True)
    
    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        print("Downloading stopwords...")
        nltk.download("stopwords", quiet=True)

setup_nltk()

# -----------------------------
# Device configuration
# -----------------------------
device = 0 if torch.cuda.is_available() else -1
print(f"🚀 Device set to: {'GPU' if device == 0 else 'CPU'}")

# -----------------------------
# Load Hugging Face Pipeline (Sentiment)
# -----------------------------
sentiment_pipe = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    device=device
)

# -----------------------------
# Enhanced Text Preprocessing
# -----------------------------
STOP_WORDS = set(stopwords.words("english"))

def preprocess_text(text):
    """Clean text: remove noise, URLs, stopwords, etc."""
    try:
        text = str(text).lower()
        # Remove URLs
        text = re.sub(r"http\S+|www\S+|https\S+", "", text)
        # Remove mentions and hashtags
        text = re.sub(r"@\w+|#\w+", "", text)
        # Remove special characters and numbers
        text = re.sub(r"[^a-z\s]", " ", text)
        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text).strip()
        # Tokenize
        words = nltk.word_tokenize(text)
        # Remove stopwords and short words
        words = [w for w in words if w not in STOP_WORDS and len(w) > 2]
        return " ".join(words)
    except Exception as e:
        print(f"Error preprocessing text: {e}")
        return ""

# -----------------------------
# Process Dataset
# -----------------------------
def process_reviews(input_file, output_prefix="processed", batch_size=20):
    """
    Process reviews from CSV file
    
    Args:
        input_file: Path to input CSV file
        output_prefix: Prefix for output files
        batch_size: Number of reviews to process at once
    """
    # Load dataset
    print(f"\n📦 Loading reviews from {input_file}...")
    try:
        df = pd.read_csv(input_file)
    except Exception as e:
        print(f"❌ Error loading file: {e}")
        sys.exit(1)
    
    # Find review column (case-insensitive)
    review_col = None
    for col in df.columns:
        if col.lower() == "review":
            review_col = col
            break
    
    if review_col is None:
        print(f"❌ Error: CSV must contain a 'review' column (case-insensitive)")
        print(f"Available columns: {', '.join(df.columns)}")
        sys.exit(1)
    
    # Standardize column name to 'review' for consistent processing
    if review_col != "review":
        df.rename(columns={review_col: "review"}, inplace=True)
        print(f"📝 Found review column: '{review_col}' (renamed to 'review' for processing)")
    
    # Clean data
    df.dropna(subset=["review"], inplace=True)
    df = df[df["review"].str.strip() != ""]
    print(f"📊 Processing {len(df)} reviews...")

    # -----------------------------
    # Process Reviews in Batches
    # -----------------------------
    results = []
    
    for i in tqdm(range(0, len(df), batch_size), desc="🔍 Processing Reviews"):
        batch = df["review"].iloc[i:i + batch_size]
        for review in batch:
            try:
                cleaned = preprocess_text(review)
                if len(cleaned.strip()) == 0:
                    continue
    
                sent_result = sentiment_pipe(cleaned[:512])[0]
                label = sent_result["label"]
                score = round(float(sent_result["score"]), 3)
    
                results.append({
                    "original_review": review,
                    "cleaned_text": cleaned,
                    "sentiment": label,
                    "confidence": score
                })
    
            except Exception as e:
                print(f"⚠️ Error processing review: {e}")
                continue

    # -----------------------------
    # Save Sentiment Results
    # -----------------------------
    if not results:
        print("❌ No reviews were successfully processed.")
        sys.exit(1)
    
    out_df = pd.DataFrame(results)
    output_file = f"{output_prefix}_sentiment.csv"
    out_df.to_csv(output_file, index=False)
    print(f"\n✅ Done! Processed {len(out_df)} reviews → '{output_file}'")

    # -----------------------------
    # Separate by Sentiment
    # -----------------------------
    positive_df = out_df[out_df["sentiment"].str.contains("positive", case=False)]
    negative_df = out_df[out_df["sentiment"].str.contains("negative", case=False)]
    neutral_df = out_df[out_df["sentiment"].str.contains("neutral", case=False)]
    
    # Save separated files
    pos_file = f"{output_prefix}_positive.csv"
    neg_file = f"{output_prefix}_negative.csv"
    neu_file = f"{output_prefix}_neutral.csv"
    
    positive_df.to_csv(pos_file, index=False)
    negative_df.to_csv(neg_file, index=False)
    neutral_df.to_csv(neu_file, index=False)
    
    print(f"\n📂 Results separated:")
    print(f"   • Positive: {len(positive_df)} reviews → '{pos_file}'")
    print(f"   • Negative: {len(negative_df)} reviews → '{neg_file}'")
    print(f"   • Neutral: {len(neutral_df)} reviews → '{neu_file}'")
    
    return out_df, positive_df, negative_df, neutral_df

# -----------------------------
# Main Execution
# -----------------------------
def main():
    """Main function to run the preprocessing pipeline"""
    parser = argparse.ArgumentParser(
        description="AI Feedback Analyzer - Batch Processing"
    )
    parser.add_argument(
        "input_file",
        help="Path to input CSV file containing 'review' column"
    )
    parser.add_argument(
        "-o", "--output-prefix",
        default="processed",
        help="Prefix for output files (default: processed)"
    )
    parser.add_argument(
        "-b", "--batch-size",
        type=int,
        default=20,
        help="Batch size for processing (default: 20)"
    )
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not Path(args.input_file).exists():
        print(f"❌ Error: File '{args.input_file}' not found")
        sys.exit(1)
    
    print("="*50)
    print("🎓 AI Feedback Analyzer - Batch Processing")
    print("="*50)
    
    # Process reviews
    try:
        process_reviews(
            input_file=args.input_file,
            output_prefix=args.output_prefix,
            batch_size=args.batch_size
        )
        print("\n✅ Processing complete!")
    except Exception as e:
        print(f"\n❌ Error during processing: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

import streamlit as st
import pandas as pd
import re
import torch
import nltk
from nltk.corpus import stopwords
from transformers import pipeline
import time
from gemini_api import GeminiAnalyzer

# ============================================
# 🧠 SETUP
# ============================================
st.set_page_config(
    page_title="AI Feedback Analyzer",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better UI
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        padding: 1rem 0;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #ff7f0e;
        margin-top: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .stProgress > div > div > div > div {
        background-color: #1f77b4;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<p class="main-header">🎓 Student Feedback Analyzer with AI Insights</p>', unsafe_allow_html=True)

# --------------------------------------------
# Sidebar Config
# --------------------------------------------
st.sidebar.title("⚙️ Configuration")
st.sidebar.markdown("---")

# Gemini API Key input
api_key = st.sidebar.text_input(
    "🔑 Gemini API Key",
    type="password",
    help="Enter your Google Gemini API key for AI-powered recommendations"
)

# Device setup
device = 0 if torch.cuda.is_available() else -1
device_emoji = "🚀" if device == 0 else "💻"
device_name = "GPU (CUDA)" if device == 0 else "CPU"
st.sidebar.success(f"{device_emoji} Using: {device_name}")

# Advanced settings
st.sidebar.markdown("---")
st.sidebar.subheader("📊 Advanced Settings")
chunk_size = st.sidebar.slider(
    "Reviews per batch (Gemini)",
    min_value=20,
    max_value=100,
    value=50,
    step=10,
    help="Number of reviews to process in each API call"
)
max_reviews = st.sidebar.number_input(
    "Max reviews to analyze",
    min_value=10,
    max_value=1000,
    value=100,
    step=10,
    help="Maximum number of negative reviews to send to Gemini"
)

st.sidebar.markdown("---")
st.sidebar.info(
    "💡 **Tip:** Upload a CSV with a 'review' column (case-insensitive) containing student feedback."
)

# --------------------------------------------
# NLTK Setup
# --------------------------------------------
@st.cache_resource
def setup_nltk():
    """Download required NLTK data"""
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt", quiet=True)
    
    try:
        nltk.data.find("corpora/stopwords")
    except LookupError:
        nltk.download("stopwords", quiet=True)

setup_nltk()

# --------------------------------------------
# Load Sentiment Model
# --------------------------------------------
@st.cache_resource
def load_sentiment_pipeline():
    """Load sentiment analysis model with caching"""
    return pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        device=device,
        truncation=True,
        max_length=512
    )

with st.spinner("🔄 Loading sentiment analysis model..."):
    sentiment_pipe = load_sentiment_pipeline()
    st.sidebar.success("✅ Model loaded successfully")

# --------------------------------------------
# Preprocessing
# --------------------------------------------
@st.cache_data
def get_stopwords():
    """Cache stopwords for better performance"""
    return set(stopwords.words("english"))

def preprocess_text(text):
    """Clean and preprocess review text"""
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
        stop_words = get_stopwords()
        words = [w for w in words if w not in stop_words and len(w) > 2]
        return " ".join(words)
    except Exception as e:
        st.warning(f"Preprocessing error: {e}")
        return ""

# ============================================
# 📤 Upload CSV
# ============================================
st.markdown("---")
st.markdown('<p class="sub-header">📁 Step 1: Upload Your Data</p>', unsafe_allow_html=True)

uploaded_file = st.file_uploader(
    "Upload CSV file containing student reviews",
    type=["csv"],
    help="CSV must contain a column named 'review' (case-insensitive: Review, REVIEW, etc.)"
)

if uploaded_file:
    try:
        df = pd.read_csv(uploaded_file)
        
        # Display data info in columns
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("📊 Total Rows", len(df))
        with col2:
            st.metric("📋 Total Columns", len(df.columns))
        with col3:
            st.metric("💾 File Size", f"{uploaded_file.size / 1024:.1f} KB")
        
        # Show data preview with expander
        with st.expander("🔍 Preview Data (First 5 rows)", expanded=True):
            st.dataframe(df.head(), use_container_width=True)
        
        # Validate review column (case-insensitive)
        review_col = None
        for col in df.columns:
            if col.lower() == "review":
                review_col = col
                break
        
        if review_col is None:
            st.error("❌ Error: CSV must contain a column named 'review' (case-insensitive)")
            st.info(f"Available columns: {', '.join(df.columns)}")
            st.stop()
        
        # Standardize column name to 'review' for consistent processing
        if review_col != "review":
            df.rename(columns={review_col: "review"}, inplace=True)
            st.info(f"📝 Found review column: '{review_col}' (renamed to 'review' for processing)")
        
    except Exception as e:
        st.error(f"❌ Error reading CSV: {e}")
        st.stop()

    # Preprocess + Sentiment Analysis
    st.markdown("---")
    st.markdown('<p class="sub-header">🧩 Step 2: Sentiment Analysis</p>', unsafe_allow_html=True)
    
    # Clean data
    df.dropna(subset=["review"], inplace=True)
    df = df[df["review"].str.strip() != ""]
    
    st.info(f"🔄 Analyzing {len(df)} reviews...")
    
    results = []
    progress_bar = st.progress(0)
    status_text = st.empty()

    for i, review in enumerate(df["review"]):
        cleaned = preprocess_text(review)
        if len(cleaned.strip()) == 0:
            continue
        
        try:
            sent = sentiment_pipe(cleaned[:512])[0]
            results.append({
                "original_review": review,
                "cleaned_text": cleaned,
                "sentiment": sent["label"],
                "confidence": round(float(sent["score"]), 3)
            })
        except Exception as e:
            st.warning(f"Skipping review {i+1}: {e}")
            continue
        
        # Update progress
        progress = (i + 1) / len(df)
        progress_bar.progress(progress)
        status_text.text(f"Processing: {i + 1}/{len(df)} reviews ({progress*100:.1f}%)")

    progress_bar.empty()
    status_text.empty()
    
    if not results:
        st.error("❌ No valid reviews were processed.")
        st.stop()
    
    out_df = pd.DataFrame(results)
    st.success(f"✅ Successfully analyzed {len(out_df)} reviews!")
    
    with st.expander("🔍 View Processed Data (First 10 rows)", expanded=False):
        st.dataframe(out_df.head(10), use_container_width=True)

    # Sentiment Distribution
    st.markdown("---")
    st.markdown('<p class="sub-header">📊 Sentiment Analysis Results</p>', unsafe_allow_html=True)
    
    # Separate sentiments
    positive_df = out_df[out_df["sentiment"].str.contains("positive", case=False)]
    negative_df = out_df[out_df["sentiment"].str.contains("negative", case=False)]
    neutral_df = out_df[out_df["sentiment"].str.contains("neutral", case=False)]
    
    # Display metrics in columns
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("😊 Positive", len(positive_df), delta=f"{len(positive_df)/len(out_df)*100:.1f}%")
    with col2:
        st.metric("😐 Neutral", len(neutral_df), delta=f"{len(neutral_df)/len(out_df)*100:.1f}%")
    with col3:
        st.metric("😞 Negative", len(negative_df), delta=f"{len(negative_df)/len(out_df)*100:.1f}%", delta_color="inverse")
    
    # Visualization
    sentiment_counts = out_df["sentiment"].value_counts()
    import plotly.express as px
    fig = px.pie(
        values=sentiment_counts.values,
        names=sentiment_counts.index,
        title="Sentiment Distribution",
        hole=0.3  # Makes it a donut chart
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Average confidence
    avg_confidence = out_df["confidence"].mean()
    st.info(f"📈 Average Confidence Score: {avg_confidence:.3f} ({avg_confidence*100:.1f}%)")

    # Download button
    st.download_button(
        "⬇️ Download Processed Results (CSV)",
        data=out_df.to_csv(index=False).encode("utf-8"),
        file_name="processed_reviews.csv",
        mime="text/csv",
        help="Download the sentiment analysis results"
    )

    # ============================================
    # 🤖 GEMINI RECOMMENDATION SECTION
    # ============================================
    st.markdown("---")
    st.markdown('<p class="sub-header">🤖 Step 3: AI-Powered Recommendations</p>', unsafe_allow_html=True)
    
    if not api_key:
        st.warning("⚠️ Please enter your Gemini API Key in the sidebar to generate AI recommendations.")
        st.info("💡 Get your API key from: https://aistudio.google.com/app/apikey")
    elif len(negative_df) == 0:
        st.success("✅ No negative reviews detected. Your institute is performing excellently! 🎉")
        st.balloons()
    else:
        # Prepare reviews for analysis
        reviews = (
            negative_df
            .sort_values(by="confidence", ascending=False)
            .head(max_reviews)
            .dropna(subset=["cleaned_text"])["cleaned_text"]
            .tolist()
        )
        
        if not reviews:
            st.warning("⚠️ No valid negative reviews available for analysis.")
        else:
            st.info(f"🔍 Analyzing {len(reviews)} negative reviews using Gemini AI...")
            
            try:
                # Initialize Gemini Analyzer
                analyzer = GeminiAnalyzer(api_key=api_key)
                
                # Progress tracking
                analysis_progress = st.progress(0)
                status_text = st.empty()
                
                def update_progress(current, total):
                    progress = current / total
                    analysis_progress.progress(progress)
                    status_text.text(f"Analyzing batch {current}/{total}...")
                
                # Analyze reviews
                with st.spinner("🧠 Gemini is analyzing the feedback..."):
                    results = analyzer.analyze_reviews(
                        reviews=reviews,
                        chunk_size=chunk_size,
                        progress_callback=update_progress
                    )
                
                analysis_progress.empty()
                status_text.empty()
                
                # Generate and display summary
                final_summary = analyzer.generate_summary(results)
                
                st.success(f"✅ Analysis complete! Processed {len(results)} batch(es)")
                st.markdown("---")
                st.markdown("## 🧠 Gemini AI Insights & Recommendations")
                st.markdown(final_summary)
                
                # Download button
                st.download_button(
                    "⬇️ Download AI Recommendations (TXT)",
                    data=final_summary.encode("utf-8"),
                    file_name="gemini_recommendations.txt",
                    mime="text/plain",
                    help="Download the complete analysis report"
                )
                
            except Exception as e:
                st.error(f"❌ Error during Gemini analysis: {e}")
                st.info("💡 Please check your API key and try again.")

else:
    st.info("👆 Please upload a CSV file to begin the analysis.")
    
    # Example format
    st.markdown("---")
    st.markdown("### 📝 Expected CSV Format")
    example_df = pd.DataFrame({
        "review": [
            "The teaching quality is excellent and the campus is beautiful.",
            "Poor infrastructure and unresponsive administration.",
            "Great learning environment with helpful faculty."
        ]
    })
    st.dataframe(example_df, use_container_width=True)

# Footer
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: gray;'>Made with ❤️ using Streamlit, HuggingFace, and Google Gemini</div>",
    unsafe_allow_html=True
)

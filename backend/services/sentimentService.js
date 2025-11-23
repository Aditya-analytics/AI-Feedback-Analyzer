const { pipeline } = require('@xenova/transformers');

let sentimentPipeline = null;

// Initialize sentiment analysis pipeline
async function initPipeline() {
  if (!sentimentPipeline) {
    console.log('🔄 Loading sentiment analysis model...');
    try {
      // Preferred 3-class model (negative/neutral/positive) via Xenova mirror
      sentimentPipeline = await pipeline(
        'sentiment-analysis',
        'Xenova/cardiffnlp-twitter-roberta-base-sentiment-latest'
      );
      console.log('✅ Sentiment model loaded (3-class)');
    } catch (e) {
      console.error('⚠️ Failed to load 3-class sentiment model, falling back to 2-class. Error:', e?.message || e);
      // Fallback 2-class (positive/negative)
      sentimentPipeline = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      console.log('✅ Sentiment model loaded (2-class fallback)');
    }
  }
  return sentimentPipeline;
}

// Preprocess text
function preprocessText(text) {
  try {
    text = String(text).toLowerCase();
    // Remove URLs, mentions, hashtags, special chars
    text = text
      .replace(/http\S+|www\S+|https\S+/g, '')
      .replace(/@\w+|#\w+/g, '')
      .replace(/[^a-z\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text;
  } catch (error) {
    console.error('Preprocessing error:', error);
    return '';
  }
}

// Analyze multiple reviews
const NEUTRAL_SCORE_THRESHOLD = 0.80; // if confidence is low, treat as neutral

async function analyzeReviews(reviews) {
  const pipe = await initPipeline();
  const results = [];

  for (const review of reviews) {
    const cleaned = preprocessText(review);
    if (!cleaned) continue;

    try {
      // Limit to 512 chars (model context window)
      const truncated = cleaned.slice(0, 512);
      const result = await pipe(truncated);

      const label = result?.[0]?.label?.toLowerCase() || 'neutral';
      const score = result?.[0]?.score ?? 0;

      // Map to consistent categories
      let normalized;
      if (label.includes('neg')) normalized = 'negative';
      else if (label.includes('neu')) normalized = 'neutral';
      else if (label.includes('pos')) normalized = 'positive';
      else normalized = 'neutral';

      // Apply neutral thresholding for low-confidence predictions
      if (normalized !== 'neutral' && score < NEUTRAL_SCORE_THRESHOLD) {
        normalized = 'neutral';
      }

      results.push({
        originalReview: review,
        cleanedText: cleaned,
        sentiment: normalized,
        confidence: Math.round(score * 1000) / 1000,
      });
    } catch (error) {
      console.error('Error analyzing review:', error);
      continue;
    }
  }

  return results;
}

module.exports = { analyzeReviews, preprocessText };

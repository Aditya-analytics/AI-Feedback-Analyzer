const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Analyze reviews in chunks and generate recommendations
async function analyzeAndRecommend(reviews, chunkSize = 50) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured in environment variables');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const chunks = chunkArray(reviews, chunkSize);
  const batchResults = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
    
    const prompt = `
You are an educational consultant analyzing student feedback. Below are ${chunks[i].length} negative reviews from students:

${chunks[i].map((review, idx) => `${idx + 1}. ${review}`).join('\n')}

Please provide:
1. **Key Issues Identified**: Summarize the main problems mentioned
2. **Common Themes**: What patterns do you see across these reviews?
3. **Priority Areas**: What should be addressed first?
4. **Specific Recommendations**: Actionable steps to improve

Keep your analysis concise and actionable.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      batchResults.push(response.text());
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      batchResults.push(`Error processing batch ${i + 1}: ${error.message}`);
    }

    // Add delay to avoid rate limiting
    if (i < chunks.length - 1) {
      await sleep(1000);
    }
  }

  // Generate final summary
  const finalPrompt = `
Based on the following analyses of student feedback batches, provide a comprehensive summary with actionable recommendations:

${batchResults.map((result, idx) => `\n### Batch ${idx + 1} Analysis:\n${result}`).join('\n')}

Please provide:
1. **Overall Summary**: What are the most critical issues?
2. **Top 5 Recommendations**: Prioritized, actionable steps
3. **Quick Wins**: Easy improvements that can be implemented immediately
4. **Long-term Strategy**: Structural changes for sustained improvement

Format your response in clear markdown.
`;

  try {
    const finalResult = await model.generateContent(finalPrompt);
    const finalResponse = await finalResult.response;
    return finalResponse.text();
  } catch (error) {
    console.error('Error generating final summary:', error);
    return batchResults.join('\n\n---\n\n');
  }
}

// Helper function to split array into chunks
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  analyzeAndRecommend
};

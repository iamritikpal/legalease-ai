const { VertexAI } = require('@google-cloud/vertexai');
const logger = require('../utils/logger');

class VertexAIService {
  constructor() {
    this.vertex_ai = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });
    
    this.model = process.env.VERTEX_AI_MODEL || 'gemini-pro';
    this.generativeModel = this.vertex_ai.preview.getGenerativeModel({
      model: this.model,
      generation_config: {
        max_output_tokens: 8192,
        temperature: 0.3,
        top_p: 0.8,
        top_k: 40,
      },
    });
  }

  /**
   * Generate plain language summary of legal document
   * @param {string} documentText - Extracted document text
   * @param {string} language - Target language ('en' or 'hi')
   * @returns {Promise<Object>} Summary with key points and explanations
   */
  async generateSummary(documentText, language = 'en') {
    try {
      const languageInstruction = language === 'hi' 
        ? 'Please respond in Hindi (हिंदी में उत्तर दें)'
        : 'Please respond in English';

      const prompt = `
You are a legal expert helping ordinary citizens understand legal documents. 
${languageInstruction}

Analyze this legal document and provide:

1. DOCUMENT TYPE: What kind of legal document this is
2. KEY PARTIES: Who are the main parties involved
3. MAIN PURPOSE: What is the primary purpose of this document
4. KEY TERMS: List the most important terms, conditions, and obligations
5. IMPORTANT DATES: Any critical dates, deadlines, or time periods
6. FINANCIAL TERMS: Any money, fees, penalties, or financial obligations
7. RIGHTS & OBLIGATIONS: What each party can do and must do
8. TERMINATION CONDITIONS: How and when the agreement can end
9. DISPUTE RESOLUTION: How conflicts will be resolved

Format your response as clear bullet points under each section.
Use simple, everyday language that a non-lawyer can understand.

Document text:
${documentText.substring(0, 15000)} // Limit text to avoid token limits

Please provide a comprehensive but concise analysis.
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = result.response;
      
      if (!response || !response.candidates || !response.candidates[0]) {
        throw new Error('No response generated from Vertex AI');
      }

      const summaryText = response.candidates[0].content.parts[0].text;
      
      logger.info(`Summary generated successfully in ${language}`);
      
      return {
        summary: summaryText,
        language,
        generatedAt: new Date().toISOString(),
        model: this.model,
      };
    } catch (error) {
      logger.error('Error generating summary with Vertex AI:', error);
      throw new Error('Failed to generate document summary');
    }
  }

  /**
   * Analyze document for risk factors and red flags
   * @param {string} documentText - Extracted document text
   * @param {string} language - Target language ('en' or 'hi')
   * @returns {Promise<Object>} Risk analysis with warnings
   */
  async analyzeRisks(documentText, language = 'en') {
    try {
      const languageInstruction = language === 'hi' 
        ? 'Please respond in Hindi (हिंदी में उत्तर दें)'
        : 'Please respond in English';

      const prompt = `
You are a legal risk analyst. Analyze this document for potential risks and red flags.
${languageInstruction}

Look for and highlight:

1. HIGH-RISK CLAUSES:
   - Unlimited liability provisions
   - Automatic renewal clauses
   - Harsh penalty terms
   - Broad indemnification requirements
   - Waiver of important rights

2. FINANCIAL RISKS:
   - Hidden fees or charges
   - Penalty clauses
   - Interest rates above market
   - Collateral requirements
   - Personal guarantees

3. UNFAIR TERMS:
   - One-sided obligations
   - Unreasonable restrictions
   - Broad non-compete clauses
   - Excessive termination penalties
   - Limited recourse options

4. UNCLEAR TERMS:
   - Vague language that could be misinterpreted
   - Missing important details
   - Contradictory clauses

For each risk identified, provide:
- Risk level (LOW, MEDIUM, HIGH, CRITICAL)
- Specific clause or section
- Plain language explanation of the risk
- Potential consequences
- Suggested action or consideration

Document text:
${documentText.substring(0, 15000)}

Focus on the most significant risks that could impact the parties involved.
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = result.response;
      
      if (!response || !response.candidates || !response.candidates[0]) {
        throw new Error('No risk analysis generated from Vertex AI');
      }

      const riskAnalysis = response.candidates[0].content.parts[0].text;
      
      logger.info(`Risk analysis completed in ${language}`);
      
      return {
        riskAnalysis,
        language,
        generatedAt: new Date().toISOString(),
        model: this.model,
      };
    } catch (error) {
      logger.error('Error analyzing risks with Vertex AI:', error);
      throw new Error('Failed to analyze document risks');
    }
  }

  /**
   * Answer specific questions about the document
   * @param {string} question - User's question
   * @param {string} documentText - Document context
   * @param {string} language - Target language ('en' or 'hi')
   * @returns {Promise<Object>} Answer with relevant context
   */
  async answerQuestion(question, documentText, language = 'en') {
    try {
      const languageInstruction = language === 'hi' 
        ? 'Please respond in Hindi (हिंदी में उत्तर दें)'
        : 'Please respond in English';

      // Find relevant sections using simple keyword matching
      const relevantSections = this.findRelevantSections(question, documentText);
      
      const prompt = `
You are a legal assistant helping someone understand their legal document.
${languageInstruction}

Based on the following legal document, please answer this question: "${question}"

Relevant sections from the document:
${relevantSections}

Full document context (first 10000 characters):
${documentText.substring(0, 10000)}

Please provide:
1. A direct answer to the question
2. Reference to specific clauses or sections if applicable
3. Explanation in simple, non-legal language
4. Any important caveats or additional considerations

If the document doesn't contain information to answer the question, please say so clearly.

IMPORTANT: Base your answer only on the information in the document. Do not provide general legal advice.
Add this disclaimer: "This is informational only and not legal advice. Consult a qualified attorney for legal guidance."
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = result.response;
      
      if (!response || !response.candidates || !response.candidates[0]) {
        throw new Error('No answer generated from Vertex AI');
      }

      const answer = response.candidates[0].content.parts[0].text;
      
      logger.info(`Question answered successfully in ${language}`);
      
      return {
        question,
        answer,
        relevantSections: relevantSections.length > 0,
        language,
        generatedAt: new Date().toISOString(),
        model: this.model,
      };
    } catch (error) {
      logger.error('Error answering question with Vertex AI:', error);
      throw new Error('Failed to answer question about document');
    }
  }

  /**
   * Find relevant sections of document based on question keywords
   * @param {string} question - User's question
   * @param {string} documentText - Full document text
   * @returns {string} Relevant sections
   */
  findRelevantSections(question, documentText) {
    const questionLower = question.toLowerCase();
    const sentences = documentText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Extract keywords from question
    const keywords = questionLower
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['what', 'when', 'where', 'how', 'why', 'does', 'will', 'can', 'should'].includes(word));
    
    // Find sentences containing question keywords
    const relevantSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return keywords.some(keyword => sentenceLower.includes(keyword));
    });
    
    // Return top 5 most relevant sentences
    return relevantSentences.slice(0, 5).join('. ').substring(0, 2000);
  }

  /**
   * Explain specific clauses in simple language
   * @param {string} clause - Specific clause text
   * @param {string} language - Target language ('en' or 'hi')
   * @returns {Promise<Object>} Simplified explanation
   */
  async explainClause(clause, language = 'en') {
    try {
      const languageInstruction = language === 'hi' 
        ? 'Please respond in Hindi (हिंदी में उत्तर दें)'
        : 'Please respond in English';

      const prompt = `
You are a legal translator who converts complex legal language into simple, everyday language.
${languageInstruction}

Please explain this legal clause in simple terms that anyone can understand:

"${clause}"

Provide:
1. What this clause means in plain language
2. What obligations or rights it creates
3. Any potential risks or benefits
4. A simple example if helpful

Use everyday words and avoid legal jargon.
`;

      const result = await this.generativeModel.generateContent(prompt);
      const response = result.response;
      
      if (!response || !response.candidates || !response.candidates[0]) {
        throw new Error('No explanation generated from Vertex AI');
      }

      const explanation = response.candidates[0].content.parts[0].text;
      
      logger.info(`Clause explained successfully in ${language}`);
      
      return {
        originalClause: clause,
        explanation,
        language,
        generatedAt: new Date().toISOString(),
        model: this.model,
      };
    } catch (error) {
      logger.error('Error explaining clause with Vertex AI:', error);
      throw new Error('Failed to explain clause');
    }
  }
}

module.exports = new VertexAIService();

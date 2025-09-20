const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const { VertexAI } = require('@google-cloud/vertexai');
const logger = require('../utils/logger');

class VertexAIService {
  constructor() {
    this.client = new PredictionServiceClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    // Initialize Vertex AI for Gemini models
    this.vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash';
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

      const response = await this.callVertexAI(prompt);
      
      logger.info(`Summary generated successfully in ${language}`);
      
      return {
        summary: response,
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
You are a legal expert specializing in risk analysis. Analyze this legal document and identify potential risks and red flags.
${languageInstruction}

Please provide a comprehensive risk analysis with:

1. HIGH-RISK CLAUSES: Identify clauses that pose significant legal or financial risks
2. FINANCIAL RISKS: Any hidden costs, penalties, or unfavorable financial terms
3. UNFAIR TERMS: One-sided obligations or terms that heavily favor one party
4. UNCLEAR LANGUAGE: Vague or ambiguous terms that could cause disputes
5. MISSING PROTECTIONS: Important protections or rights that should be included
6. TERMINATION RISKS: Unfavorable termination conditions or penalties
7. LIABILITY CONCERNS: Excessive liability or indemnification requirements
8. COMPLIANCE ISSUES: Terms that might conflict with laws or regulations

For each risk, indicate:
- Risk Level: HIGH, MEDIUM, or LOW
- Brief explanation of why it's risky
- Potential consequences

Format as clear bullet points under each category.
Use simple language that non-lawyers can understand.

Document text:
${documentText.substring(0, 15000)} // Limit text to avoid token limits

Provide a thorough but concise risk analysis.
`;

      const response = await this.callVertexAI(prompt);
      
      logger.info(`Risk analysis generated successfully in ${language}`);
      
      return {
        risks: response,
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

      // Find relevant sections for better context
      const relevantSections = this.findRelevantSections(question, documentText);

      const prompt = `
You are a legal expert helping people understand legal documents. A user has asked a specific question about their legal document.
${languageInstruction}

User's Question: "${question}"

Based on this legal document, please provide a comprehensive answer that:

1. DIRECT ANSWER: Answer the specific question clearly and directly
2. RELEVANT CLAUSES: Quote and explain the specific clauses that relate to the question
3. IMPLICATIONS: Explain what this means in practical terms
4. IMPORTANT DETAILS: Highlight any important dates, conditions, or requirements
5. POTENTIAL ISSUES: Point out any potential problems or things to watch out for
6. NEXT STEPS: Suggest what the user should do or consider

Use simple, clear language that a non-lawyer can understand.
Always include relevant quotes from the document to support your answer.

Relevant document sections:
${relevantSections}

Full document context (if needed):
${documentText.substring(0, 10000)} // Limit for context

**Important**: End your response with this disclaimer:
"**Disclaimer**: This is informational analysis only and not legal advice. For legal guidance specific to your situation, please consult a qualified attorney."
`;

      const response = await this.callVertexAI(prompt);
      
      logger.info(`Question answered successfully in ${language}`);
      
      return {
        question,
        answer: response,
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
You are a legal expert who specializes in explaining complex legal language in simple terms. 
${languageInstruction}

Please explain this legal clause in plain English that anyone can understand:

"${clause}"

Provide a comprehensive explanation that includes:

1. SIMPLE EXPLANATION: What does this clause mean in everyday language?
2. KEY OBLIGATIONS: What does each party have to do because of this clause?
3. RIGHTS GRANTED: What rights or protections does this clause provide?
4. CONSEQUENCES: What happens if someone doesn't follow this clause?
5. PRACTICAL IMPACT: How does this affect the people involved in real life?
6. POTENTIAL RISKS: Are there any risks or downsides to be aware of?
7. IMPORTANT NOTES: Any critical details, exceptions, or conditions?

Use simple words and avoid legal jargon. Explain any technical terms you must use.
Break down complex sentences into easier parts.
Use examples if helpful to illustrate the meaning.

Format your response clearly with headings and bullet points where appropriate.
`;

      const response = await this.callVertexAI(prompt);
      
      logger.info(`Clause explained successfully in ${language}`);
      
      return {
        originalClause: clause,
        explanation: response,
        language,
        generatedAt: new Date().toISOString(),
        model: this.model,
      };
    } catch (error) {
      logger.error('Error explaining clause with Vertex AI:', error);
      throw new Error('Failed to explain clause');
    }
  }

  /**
   * Helper method to call Vertex AI
   * @param {string} prompt - The prompt to send
   * @returns {Promise<string>} AI response
   */
  async callVertexAI(prompt) {
    try {
      // Check if we're using a Gemini model
      if (this.model.includes('gemini')) {
        return await this.callVertexGenerativeAPI(prompt);
      } else {
        return await this.callVertexPredictAPI(prompt);
      }
    } catch (error) {
      logger.error('Error calling Vertex AI:', error);
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Call Vertex AI Generative Service for Gemini models
   * @param {string} prompt - The prompt to send
   * @returns {Promise<string>} AI response
   */
  async callVertexGenerativeAPI(prompt) {
    try {
      // Get the generative model
      const model = this.vertexAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      logger.info(`Calling Vertex AI Generative Service: ${this.model} at ${this.location}`);

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Extract text from the response
      let responseText = '';
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          responseText = candidate.content.parts[0].text;
        }
      }

      if (!responseText) {
        throw new Error('No text content in Vertex AI response');
      }

      logger.info('Vertex AI Generative Service response received successfully');
      return responseText;
    } catch (error) {
      logger.error('Error calling Vertex AI Generative Service:', error);
      throw error;
    }
  }

  /**
   * Call Vertex AI Predict API for non-Gemini models
   * @param {string} prompt - The prompt to send
   * @returns {Promise<string>} AI response
   */
  async callVertexPredictAPI(prompt) {
    try {
      // Construct the endpoint for Vertex AI model
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;
      
      // Prepare the request payload
      const instanceValue = {
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 2048,
          top_p: 0.8,
          top_k: 40
        },
        safety_settings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const instances = [instanceValue];
      
      const request = {
        endpoint,
        instances,
      };

      logger.info(`Calling Vertex AI Predict API: ${this.model} at ${this.location}`);

      // Make the prediction request
      const [response] = await this.client.predict(request);
      
      if (!response.predictions || response.predictions.length === 0) {
        throw new Error('No predictions returned from Vertex AI');
      }

      const prediction = response.predictions[0];
      
      // Extract text from response
      let responseText = '';
      if (prediction.candidates && prediction.candidates.length > 0) {
        const candidate = prediction.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          responseText = candidate.content.parts[0].text;
        }
      }

      if (!responseText) {
        throw new Error('No text content in Vertex AI response');
      }

      logger.info('Vertex AI response received successfully');
      return responseText;
      
    } catch (error) {
      logger.error('Error calling Vertex AI:', error);
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Get fallback response when AI fails
   * @param {Error} error - The error that occurred
   * @returns {string} Fallback response
   */
  getFallbackResponse(error) {
    // Check for permission errors
    if (error.message.includes('PERMISSION_DENIED') || error.code === 7) {
      logger.error('Permission denied for Vertex AI. Please check IAM permissions.');
      
      // Return helpful fallback with permission instructions
      return `
VERTEX AI PERMISSION ERROR

Your service account needs Vertex AI permissions. Here's how to fix it:

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=${this.projectId}
2. Find service account: h2skill@h2skill-472620.iam.gserviceaccount.com  
3. Add these roles:
   - Vertex AI User
   - AI Platform User
   - ML Developer

4. Enable Vertex AI API:
   - Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
   - Click "Enable"

5. Try again after fixing permissions

Current config: ${this.projectId}/${this.location}/${this.model}

This is a permission error response. Fix the above permissions for real AI analysis.
`;
    }
    
    // For other errors, provide helpful fallback
    logger.warn('Using fallback response due to Vertex AI error');
    return `
VERTEX AI CONFIGURATION NEEDED

There was an issue connecting to Vertex AI. This could be due to:

1. Missing API enablement
2. Incorrect model configuration  
3. Network connectivity issues

Current configuration:
- Project: ${this.projectId}
- Location: ${this.location}
- Model: ${this.model}

Please check your Google Cloud setup and try again.

This is a fallback response. The document analysis would appear here once Vertex AI is properly configured.
`;
  }
}

module.exports = new VertexAIService();
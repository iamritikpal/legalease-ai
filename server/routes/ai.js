const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { qaRateLimiter, aiRateLimiter } = require('../middleware/rateLimiter');
const vertexAI = require('../services/vertexAI');
const firestore = require('../services/firestore');
const logger = require('../utils/logger');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const questionSchema = Joi.object({
  question: Joi.string().min(3).max(500).required(),
  language: Joi.string().valid('en', 'hi').default('en'),
});

const clauseExplanationSchema = Joi.object({
  clause: Joi.string().min(10).max(2000).required(),
  language: Joi.string().valid('en', 'hi').default('en'),
});

/**
 * Ask question about a document
 * POST /api/ai/question/:documentId
 */
router.post('/question/:documentId', qaRateLimiter, asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  try {
    // Validate request body
    const { error, value } = questionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { question, language } = value;

    // Get document data
    const document = await firestore.getDocument(documentId);
    
    if (!document.extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Document text not available. Please ensure the document was processed successfully.',
      });
    }

    logger.logAIInteraction('question', 'gemini-pro', {
      documentId,
      question: question.substring(0, 100) + '...',
      language,
    });

    // Generate answer using Vertex AI
    const answerResult = await vertexAI.answerQuestion(
      question,
      document.extractedText,
      language
    );

    // Save Q&A to Firestore
    const qaData = {
      question,
      answer: answerResult.answer,
      language,
      model: answerResult.model,
      relevantSections: answerResult.relevantSections,
      timestamp: new Date().toISOString(),
    };

    const qaId = await firestore.saveQA(documentId, qaData);

    res.json({
      success: true,
      data: {
        id: qaId,
        ...answerResult,
      },
    });

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId, action: 'question_answering' });
    res.status(500).json({
      success: false,
      error: 'Failed to answer question',
    });
  }
}));

/**
 * Get Q&A history for a document
 * GET /api/ai/questions/:documentId
 */
router.get('/questions/:documentId', asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { limit = 20 } = req.query;

  try {
    // Verify document exists
    await firestore.getDocument(documentId);
    
    // Get Q&A history
    const qas = await firestore.getDocumentQAs(documentId);
    
    // Limit results
    const limitedQAs = qas.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedQAs,
      total: qas.length,
    });

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId, action: 'get_qa_history' });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve Q&A history',
    });
  }
}));

/**
 * Explain a specific clause
 * POST /api/ai/explain-clause
 */
router.post('/explain-clause', aiRateLimiter, asyncHandler(async (req, res) => {
  try {
    // Validate request body
    const { error, value } = clauseExplanationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const { clause, language } = value;

    logger.logAIInteraction('clause_explanation', 'gemini-pro', {
      clauseLength: clause.length,
      language,
    });

    // Generate explanation using Vertex AI
    const explanationResult = await vertexAI.explainClause(clause, language);

    res.json({
      success: true,
      data: explanationResult,
    });

  } catch (error) {
    logger.logError(error, { action: 'clause_explanation' });
    res.status(500).json({
      success: false,
      error: 'Failed to explain clause',
    });
  }
}));

/**
 * Regenerate summary for a document
 * POST /api/ai/regenerate-summary/:documentId
 */
router.post('/regenerate-summary/:documentId', aiRateLimiter, asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { language = 'en' } = req.body;

  try {
    // Get document data
    const document = await firestore.getDocument(documentId);
    
    if (!document.extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Document text not available for summary generation.',
      });
    }

    logger.logAIInteraction('regenerate_summary', 'gemini-pro', {
      documentId,
      language,
    });

    // Generate new summary
    const summaryResult = await vertexAI.generateSummary(
      document.extractedText,
      language
    );

    // Update document with new summary
    await firestore.updateDocument(documentId, {
      summary: summaryResult,
      language,
    });

    res.json({
      success: true,
      message: 'Summary regenerated successfully',
      data: summaryResult,
    });

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId, action: 'regenerate_summary' });
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate summary',
    });
  }
}));

/**
 * Regenerate risk analysis for a document
 * POST /api/ai/regenerate-risks/:documentId
 */
router.post('/regenerate-risks/:documentId', aiRateLimiter, asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { language = 'en' } = req.body;

  try {
    // Get document data
    const document = await firestore.getDocument(documentId);
    
    if (!document.extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Document text not available for risk analysis.',
      });
    }

    logger.logAIInteraction('regenerate_risks', 'gemini-pro', {
      documentId,
      language,
    });

    // Generate new risk analysis
    const riskResult = await vertexAI.analyzeRisks(
      document.extractedText,
      language
    );

    // Update document with new risk analysis
    await firestore.updateDocument(documentId, {
      riskAnalysis: riskResult,
      language,
    });

    res.json({
      success: true,
      message: 'Risk analysis regenerated successfully',
      data: riskResult,
    });

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId, action: 'regenerate_risks' });
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate risk analysis',
    });
  }
}));

/**
 * Get AI service status and usage statistics
 * GET /api/ai/status
 */
router.get('/status', asyncHandler(async (req, res) => {
  try {
    // This would typically connect to monitoring services
    // For now, return basic status
    const status = {
      vertexAI: {
        status: 'operational',
        model: process.env.VERTEX_AI_MODEL || 'gemini-pro',
        location: process.env.VERTEX_AI_LOCATION || 'us-central1',
      },
      documentAI: {
        status: 'operational',
        location: process.env.DOCUMENT_AI_LOCATION || 'us',
      },
      features: {
        summarization: true,
        riskAnalysis: true,
        questionAnswering: true,
        clauseExplanation: true,
        bilingualSupport: true,
      },
      supportedLanguages: ['en', 'hi'],
      supportedFormats: ['PDF', 'JPEG', 'PNG', 'TXT'],
    };

    res.json({
      success: true,
      data: status,
    });

  } catch (error) {
    logger.logError(error, { action: 'get_ai_status' });
    res.status(500).json({
      success: false,
      error: 'Failed to get AI service status',
    });
  }
}));

/**
 * Batch process multiple questions
 * POST /api/ai/batch-questions/:documentId
 */
router.post('/batch-questions/:documentId', aiRateLimiter, asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { questions, language = 'en' } = req.body;

  if (!Array.isArray(questions) || questions.length === 0 || questions.length > 5) {
    return res.status(400).json({
      success: false,
      error: 'Please provide 1-5 questions in an array',
    });
  }

  try {
    // Get document data
    const document = await firestore.getDocument(documentId);
    
    if (!document.extractedText) {
      return res.status(400).json({
        success: false,
        error: 'Document text not available.',
      });
    }

    logger.logAIInteraction('batch_questions', 'gemini-pro', {
      documentId,
      questionCount: questions.length,
      language,
    });

    // Process questions in parallel (with some rate limiting consideration)
    const answers = await Promise.all(
      questions.map(async (question, index) => {
        try {
          // Add small delay to avoid overwhelming the API
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * index));
          }
          
          const result = await vertexAI.answerQuestion(
            question,
            document.extractedText,
            language
          );

          // Save to Firestore
          const qaData = {
            question,
            answer: result.answer,
            language,
            model: result.model,
            relevantSections: result.relevantSections,
            timestamp: new Date().toISOString(),
            batchId: `batch_${Date.now()}`,
          };

          const qaId = await firestore.saveQA(documentId, qaData);

          return {
            id: qaId,
            ...result,
          };
        } catch (error) {
          logger.logError(error, { question, documentId });
          return {
            question,
            error: 'Failed to answer this question',
            success: false,
          };
        }
      })
    );

    res.json({
      success: true,
      data: answers,
      processed: answers.filter(a => !a.error).length,
      failed: answers.filter(a => a.error).length,
    });

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId, action: 'batch_questions' });
    res.status(500).json({
      success: false,
      error: 'Failed to process batch questions',
    });
  }
}));

module.exports = router;

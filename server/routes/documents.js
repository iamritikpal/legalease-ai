const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadRateLimiter } = require('../middleware/rateLimiter');
const cloudStorage = require('../services/cloudStorage');
const documentAI = require('../services/documentAI');
const vertexAI = require('../services/vertexAI');
const firestore = require('../services/firestore');
const logger = require('../utils/logger');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const uploadSchema = Joi.object({
  language: Joi.string().valid('en', 'hi').default('en'),
});

/**
 * Upload and process document
 * POST /api/documents/upload
 */
router.post('/upload', uploadRateLimiter, asyncHandler(async (req, res) => {
  const upload = req.app.locals.upload;
  
  // Handle file upload
  upload.single('document')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    try {
      // Validate request body
      const { error, value } = uploadSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
      }

      const { language } = value;
      const file = req.file;

      logger.logDocumentProcessing('upload_started', null, {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        language,
      });

      // Step 1: Upload to Cloud Storage
      const uploadResult = await cloudStorage.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Step 2: Save initial document metadata
      const documentData = {
        fileId: uploadResult.fileId,
        fileName: uploadResult.fileName,
        originalName: uploadResult.originalName,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        publicUrl: uploadResult.publicUrl,
        language,
        status: 'processing',
        processingSteps: {
          uploaded: true,
          textExtracted: false,
          summarized: false,
          riskAnalyzed: false,
        },
      };

      const documentId = await firestore.saveDocument(documentData);

      // Step 3: Extract text using Document AI
      let extractedData;
      try {
        extractedData = await documentAI.extractText(file.buffer, file.mimetype);
        
        await firestore.updateDocument(documentId, {
          extractedText: extractedData.text,
          extractedData,
          'processingSteps.textExtracted': true,
        });

        logger.logDocumentProcessing('text_extracted', documentId, {
          pages: extractedData.pages,
          entities: extractedData.entities.length,
          confidence: extractedData.confidence,
        });
      } catch (error) {
        logger.logError(error, { documentId, step: 'text_extraction' });
        
        await firestore.updateDocument(documentId, {
          status: 'error',
          error: 'Failed to extract text from document',
        });

        return res.status(500).json({
          success: false,
          error: 'Failed to extract text from document',
          documentId,
        });
      }

      // Step 4: Generate summary and risk analysis (in parallel)
      try {
        const [summaryResult, riskResult] = await Promise.all([
          vertexAI.generateSummary(extractedData.text, language),
          vertexAI.analyzeRisks(extractedData.text, language),
        ]);

        await firestore.updateDocument(documentId, {
          summary: summaryResult,
          riskAnalysis: riskResult,
          status: 'completed',
          'processingSteps.summarized': true,
          'processingSteps.riskAnalyzed': true,
        });

        logger.logDocumentProcessing('processing_completed', documentId, {
          language,
          summaryGenerated: true,
          riskAnalyzed: true,
        });

        // Return success response
        res.json({
          success: true,
          message: 'Document processed successfully',
          documentId,
          data: {
            fileInfo: uploadResult,
            extractedData: {
              pages: extractedData.pages,
              entities: extractedData.entities.length,
              confidence: extractedData.confidence,
            },
            summary: summaryResult,
            riskAnalysis: riskResult,
          },
        });

      } catch (error) {
        logger.logError(error, { documentId, step: 'ai_processing' });
        
        await firestore.updateDocument(documentId, {
          status: 'partial',
          error: 'Failed to complete AI processing',
        });

        // Return partial success
        res.json({
          success: true,
          message: 'Document uploaded and text extracted, but AI processing failed',
          documentId,
          data: {
            fileInfo: uploadResult,
            extractedData,
          },
          warning: 'AI processing failed - you can retry later',
        });
      }

    } catch (error) {
      logger.logError(error, { step: 'document_upload' });
      
      res.status(500).json({
        success: false,
        error: 'Failed to process document',
        details: error.message,
      });
    }
  });
}));

/**
 * Get document by ID
 * GET /api/documents/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const document = await firestore.getDocument(id);
    
    // Don't return sensitive URLs in production
    if (process.env.NODE_ENV === 'production') {
      delete document.publicUrl;
    }

    res.json({
      success: true,
      data: document,
    });

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId: id });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document',
    });
  }
}));

/**
 * Delete document
 * DELETE /api/documents/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Get document info first
    const document = await firestore.getDocument(id);
    
    // Delete from Cloud Storage
    if (document.fileName) {
      await cloudStorage.deleteFile(document.fileName);
    }

    // Delete from Firestore
    const deleted = await firestore.deleteDocument(id);

    if (deleted) {
      logger.logDocumentProcessing('document_deleted', id);
      
      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete document',
      });
    }

  } catch (error) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    logger.logError(error, { documentId: id });
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
}));

/**
 * Get recent documents
 * GET /api/documents
 */
router.get('/', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  try {
    const documents = await firestore.getRecentDocuments(parseInt(limit));
    
    // Remove sensitive data
    const sanitizedDocuments = documents.map(doc => ({
      id: doc.id,
      originalName: doc.originalName,
      size: doc.size,
      mimeType: doc.mimeType,
      language: doc.language,
      status: doc.status,
      createdAt: doc.createdAt,
      processingSteps: doc.processingSteps,
    }));

    res.json({
      success: true,
      data: sanitizedDocuments,
    });

  } catch (error) {
    logger.logError(error, { action: 'get_recent_documents' });
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents',
    });
  }
}));

/**
 * Retry processing for failed documents
 * POST /api/documents/:id/retry
 */
router.post('/:id/retry', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { language = 'en' } = req.body;

  try {
    const document = await firestore.getDocument(id);
    
    if (document.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Document is already processed',
      });
    }

    if (!document.extractedText) {
      return res.status(400).json({
        success: false,
        error: 'No extracted text available for processing',
      });
    }

    logger.logDocumentProcessing('retry_processing', id, { language });

    // Retry AI processing
    const [summaryResult, riskResult] = await Promise.all([
      vertexAI.generateSummary(document.extractedText, language),
      vertexAI.analyzeRisks(document.extractedText, language),
    ]);

    await firestore.updateDocument(id, {
      summary: summaryResult,
      riskAnalysis: riskResult,
      language,
      status: 'completed',
      'processingSteps.summarized': true,
      'processingSteps.riskAnalyzed': true,
    });

    res.json({
      success: true,
      message: 'Document processing completed',
      data: {
        summary: summaryResult,
        riskAnalysis: riskResult,
      },
    });

  } catch (error) {
    logger.logError(error, { documentId: id, action: 'retry_processing' });
    
    await firestore.updateDocument(id, {
      status: 'error',
      error: 'Retry processing failed',
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retry document processing',
    });
  }
}));

module.exports = router;

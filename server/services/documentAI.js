const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const logger = require('../utils/logger');

class DocumentAIService {
  constructor() {
    this.client = new DocumentProcessorServiceClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.location = process.env.DOCUMENT_AI_LOCATION || 'us';
    this.processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
  }

  /**
   * Extract text and structure from document
   * @param {Buffer} documentBuffer - Document buffer
   * @param {string} mimeType - Document MIME type
   * @returns {Promise<Object>} Extracted text and metadata
   */
  async extractText(documentBuffer, mimeType) {
    try {
      // Check if processor ID is configured
      if (!this.processorId || this.processorId === 'your-processor-id-here' || this.processorId === 'REPLACE_WITH_YOUR_PROCESSOR_ID') {
        logger.warn('Document AI processor not configured. Please create a processor in Google Cloud Console.');
        
        // Return mock data for now
        const mockText = `
LEGAL DOCUMENT ANALYSIS

This document appears to be a legal agreement or contract. The following is a mock extraction since the Document AI processor is not yet configured.

SAMPLE RENTAL AGREEMENT

This Rental Agreement is entered into between the Landlord and Tenant for the rental of residential property.

TERMS:
- Monthly rent amount to be paid
- Security deposit required
- Lease term and duration
- Maintenance responsibilities
- Pet policy and restrictions
- Termination conditions

IMPORTANT CLAUSES:
- Late payment fees may apply
- Property inspection rights
- Subletting restrictions
- Utilities and services allocation

To get real text extraction from your uploaded PDF, please:
1. Go to Google Cloud Console
2. Navigate to Document AI
3. Create a Document OCR processor
4. Update the DOCUMENT_AI_PROCESSOR_ID in your .env file

Current configuration:
- Project: ${this.projectId}
- Location: ${this.location}
- Processor ID: ${this.processorId} (NEEDS TO BE CONFIGURED)
`;

        const extractedData = {
          text: mockText,
          pages: 1,
          entities: [
            { type: 'ORGANIZATION', text: 'Landlord', confidence: 0.95 },
            { type: 'ORGANIZATION', text: 'Tenant', confidence: 0.95 },
            { type: 'DOCUMENT_TYPE', text: 'Rental Agreement', confidence: 0.98 }
          ],
          tables: [],
          paragraphs: [
            { pageNumber: 1, text: 'LEGAL DOCUMENT ANALYSIS', confidence: 0.98 },
            { pageNumber: 1, text: 'SAMPLE RENTAL AGREEMENT', confidence: 0.95 }
          ],
          confidence: 0.85,
        };

        logger.info(`Mock document processed. Please configure Document AI processor for real extraction.`);
        return extractedData;
      }

      // Real Document AI processing
      const name = `projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}`;
      
      const request = {
        name,
        rawDocument: {
          content: documentBuffer.toString('base64'),
          mimeType,
        },
      };

      const [result] = await this.client.processDocument(request);
      const { document } = result;

      if (!document || !document.text) {
        throw new Error('No text extracted from document');
      }

      // Extract structured information
      const extractedData = {
        text: document.text,
        pages: document.pages?.length || 0,
        entities: this.extractEntities(document.entities || []),
        tables: this.extractTables(document.pages || []),
        paragraphs: this.extractParagraphs(document.pages || []),
        confidence: this.calculateOverallConfidence(document.pages || []),
      };

      logger.info(`Document processed successfully. Pages: ${extractedData.pages}, Entities: ${extractedData.entities.length}`);
      
      return extractedData;
    } catch (error) {
      logger.error('Error processing document with Document AI:', error);
      
      // Handle specific error types with helpful guidance
      if (error.message.includes('credentials') || error.message.includes('authentication')) {
        logger.error('Authentication error. Please check your service account configuration.');
      } else if (error.message.includes('PERMISSION_DENIED') || error.code === 7) {
        logger.error('Permission denied. Please add Document AI permissions to your service account.');
        logger.error('Go to: https://console.cloud.google.com/iam-admin/iam?project=' + this.projectId);
        logger.error('Add role: Document AI API User to: h2skill@h2skill-472620.iam.gserviceaccount.com');
        
        // Return mock data with permission error explanation
        const mockText = `
PERMISSION ERROR - DOCUMENT AI ACCESS DENIED

Your service account needs Document AI permissions. Here's how to fix it:

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=${this.projectId}
2. Find service account: h2skill@h2skill-472620.iam.gserviceaccount.com
3. Click edit (pencil icon)
4. Add these roles:
   - Document AI API User
   - Document AI Editor
   - AI Platform User
   - Vertex AI User

5. Save and try uploading again

MOCK LEGAL DOCUMENT ANALYSIS (for demonstration):

This would be a real legal document analysis once permissions are fixed.

SAMPLE RENTAL AGREEMENT ANALYSIS:
- Document Type: Rental/Lease Agreement
- Key Terms: Monthly rent, security deposit, lease duration
- Important Dates: Lease start/end dates, payment due dates
- Financial Terms: Rent amount, fees, deposits
- Rights & Obligations: Landlord and tenant responsibilities
- Risk Factors: Late fees, termination clauses, liability terms

Current Status: PERMISSION ERROR - Fix IAM permissions to enable real document processing.
`;

        const extractedData = {
          text: mockText,
          pages: 1,
          entities: [
            { type: 'ERROR', text: 'PERMISSION_DENIED', confidence: 1.0 },
            { type: 'ACTION_REQUIRED', text: 'Fix IAM Permissions', confidence: 1.0 }
          ],
          tables: [],
          paragraphs: [
            { pageNumber: 1, text: 'PERMISSION ERROR - DOCUMENT AI ACCESS DENIED', confidence: 1.0 }
          ],
          confidence: 1.0,
        };

        logger.info('Returning mock data due to permission error. Fix IAM permissions for real processing.');
        return extractedData;
      }
      
      throw new Error('Failed to extract text from document');
    }
  }

  /**
   * Extract entities from document
   * @param {Array} entities - Raw entities from Document AI
   * @returns {Array} Processed entities
   */
  extractEntities(entities) {
    return entities.map(entity => ({
      type: entity.type,
      text: entity.textAnchor?.content || entity.mentionText,
      confidence: entity.confidence,
      normalizedValue: entity.normalizedValue,
    })).filter(entity => entity.confidence > 0.5);
  }

  /**
   * Extract tables from document pages
   * @param {Array} pages - Document pages
   * @returns {Array} Extracted tables
   */
  extractTables(pages) {
    const tables = [];
    
    pages.forEach((page, pageIndex) => {
      if (page.tables) {
        page.tables.forEach((table, tableIndex) => {
          const tableData = {
            pageNumber: pageIndex + 1,
            tableIndex: tableIndex + 1,
            rows: table.bodyRows?.length || 0,
            columns: table.headerRows?.[0]?.cells?.length || 0,
            content: this.extractTableContent(table),
          };
          tables.push(tableData);
        });
      }
    });
    
    return tables;
  }

  /**
   * Extract table content
   * @param {Object} table - Table object from Document AI
   * @returns {Array} Table content as 2D array
   */
  extractTableContent(table) {
    const content = [];
    
    // Extract header rows
    if (table.headerRows) {
      table.headerRows.forEach(row => {
        const rowData = row.cells.map(cell => 
          cell.layout?.textAnchor?.content?.trim() || ''
        );
        content.push(rowData);
      });
    }
    
    // Extract body rows
    if (table.bodyRows) {
      table.bodyRows.forEach(row => {
        const rowData = row.cells.map(cell => 
          cell.layout?.textAnchor?.content?.trim() || ''
        );
        content.push(rowData);
      });
    }
    
    return content;
  }

  /**
   * Extract paragraphs from document pages
   * @param {Array} pages - Document pages
   * @returns {Array} Extracted paragraphs
   */
  extractParagraphs(pages) {
    const paragraphs = [];
    
    pages.forEach((page, pageIndex) => {
      if (page.paragraphs) {
        page.paragraphs.forEach(paragraph => {
          const text = paragraph.layout?.textAnchor?.content?.trim();
          if (text && text.length > 10) { // Filter out very short paragraphs
            paragraphs.push({
              pageNumber: pageIndex + 1,
              text,
              confidence: paragraph.layout?.confidence || 0,
            });
          }
        });
      }
    });
    
    return paragraphs.filter(p => p.confidence > 0.7);
  }

  /**
   * Calculate overall confidence score
   * @param {Array} pages - Document pages
   * @returns {number} Overall confidence score
   */
  calculateOverallConfidence(pages) {
    if (!pages.length) return 0;
    
    let totalConfidence = 0;
    let elementCount = 0;
    
    pages.forEach(page => {
      if (page.paragraphs) {
        page.paragraphs.forEach(paragraph => {
          if (paragraph.layout?.confidence) {
            totalConfidence += paragraph.layout.confidence;
            elementCount++;
          }
        });
      }
    });
    
    return elementCount > 0 ? totalConfidence / elementCount : 0;
  }

  /**
   * Extract key-value pairs (useful for forms)
   * @param {Array} pages - Document pages
   * @returns {Array} Key-value pairs
   */
  extractKeyValuePairs(pages) {
    const keyValuePairs = [];
    
    pages.forEach(page => {
      if (page.formFields) {
        page.formFields.forEach(field => {
          const key = field.fieldName?.textAnchor?.content?.trim();
          const value = field.fieldValue?.textAnchor?.content?.trim();
          
          if (key && value) {
            keyValuePairs.push({
              key,
              value,
              confidence: Math.min(
                field.fieldName?.confidence || 0,
                field.fieldValue?.confidence || 0
              ),
            });
          }
        });
      }
    });
    
    return keyValuePairs.filter(pair => pair.confidence > 0.6);
  }
}

module.exports = new DocumentAIService();

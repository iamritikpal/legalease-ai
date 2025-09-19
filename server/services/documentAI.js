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

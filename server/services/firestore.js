const { Firestore } = require('@google-cloud/firestore');
const logger = require('../utils/logger');

class FirestoreService {
  constructor() {
    this.db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
    });
    
    // Collection references
    this.documentsCollection = this.db.collection('documents');
    this.sessionsCollection = this.db.collection('sessions');
    this.analyticsCollection = this.db.collection('analytics');
  }

  /**
   * Save document metadata and processing results
   * @param {Object} documentData - Document information
   * @returns {Promise<string>} Document ID
   */
  async saveDocument(documentData) {
    try {
      const docRef = await this.documentsCollection.add({
        ...documentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      logger.info(`Document saved to Firestore: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      logger.error('Error saving document to Firestore:', error);
      throw new Error('Failed to save document data');
    }
  }

  /**
   * Get document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocument(documentId) {
    try {
      const docSnap = await this.documentsCollection.doc(documentId).get();
      
      if (!docSnap.exists) {
        throw new Error('Document not found');
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } catch (error) {
      logger.error('Error getting document from Firestore:', error);
      throw new Error('Failed to retrieve document');
    }
  }

  /**
   * Update document with processing results
   * @param {string} documentId - Document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async updateDocument(documentId, updateData) {
    try {
      await this.documentsCollection.doc(documentId).update({
        ...updateData,
        updatedAt: new Date(),
      });
      
      logger.info(`Document updated in Firestore: ${documentId}`);
      return true;
    } catch (error) {
      logger.error('Error updating document in Firestore:', error);
      throw new Error('Failed to update document');
    }
  }

  /**
   * Save user session data
   * @param {Object} sessionData - Session information
   * @returns {Promise<string>} Session ID
   */
  async saveSession(sessionData) {
    try {
      const sessionRef = await this.sessionsCollection.add({
        ...sessionData,
        createdAt: new Date(),
        lastActivity: new Date(),
      });
      
      logger.info(`Session saved to Firestore: ${sessionRef.id}`);
      return sessionRef.id;
    } catch (error) {
      logger.error('Error saving session to Firestore:', error);
      throw new Error('Failed to save session data');
    }
  }

  /**
   * Get user session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session data
   */
  async getSession(sessionId) {
    try {
      const sessionSnap = await this.sessionsCollection.doc(sessionId).get();
      
      if (!sessionSnap.exists) {
        throw new Error('Session not found');
      }
      
      return {
        id: sessionSnap.id,
        ...sessionSnap.data(),
      };
    } catch (error) {
      logger.error('Error getting session from Firestore:', error);
      throw new Error('Failed to retrieve session');
    }
  }

  /**
   * Update session activity
   * @param {string} sessionId - Session ID
   * @param {Object} activityData - Activity data
   * @returns {Promise<boolean>} Success status
   */
  async updateSession(sessionId, activityData) {
    try {
      await this.sessionsCollection.doc(sessionId).update({
        ...activityData,
        lastActivity: new Date(),
      });
      
      return true;
    } catch (error) {
      logger.error('Error updating session in Firestore:', error);
      return false;
    }
  }

  /**
   * Save Q&A interaction
   * @param {string} documentId - Document ID
   * @param {Object} qaData - Question and answer data
   * @returns {Promise<string>} QA ID
   */
  async saveQA(documentId, qaData) {
    try {
      const qaRef = await this.documentsCollection
        .doc(documentId)
        .collection('qa')
        .add({
          ...qaData,
          createdAt: new Date(),
        });
      
      logger.info(`Q&A saved for document: ${documentId}`);
      return qaRef.id;
    } catch (error) {
      logger.error('Error saving Q&A to Firestore:', error);
      throw new Error('Failed to save Q&A data');
    }
  }

  /**
   * Get all Q&A for a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Array>} Array of Q&A data
   */
  async getDocumentQAs(documentId) {
    try {
      const qaSnap = await this.documentsCollection
        .doc(documentId)
        .collection('qa')
        .orderBy('createdAt', 'desc')
        .get();
      
      const qas = [];
      qaSnap.forEach(doc => {
        qas.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return qas;
    } catch (error) {
      logger.error('Error getting Q&As from Firestore:', error);
      throw new Error('Failed to retrieve Q&A data');
    }
  }

  /**
   * Save analytics data
   * @param {Object} analyticsData - Analytics information
   * @returns {Promise<boolean>} Success status
   */
  async saveAnalytics(analyticsData) {
    try {
      await this.analyticsCollection.add({
        ...analyticsData,
        timestamp: new Date(),
      });
      
      return true;
    } catch (error) {
      logger.error('Error saving analytics to Firestore:', error);
      return false;
    }
  }

  /**
   * Delete document and all associated data
   * @param {string} documentId - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId) {
    try {
      const batch = this.db.batch();
      
      // Delete main document
      batch.delete(this.documentsCollection.doc(documentId));
      
      // Delete associated Q&As
      const qaSnap = await this.documentsCollection
        .doc(documentId)
        .collection('qa')
        .get();
      
      qaSnap.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      logger.info(`Document and associated data deleted: ${documentId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting document from Firestore:', error);
      return false;
    }
  }

  /**
   * Get recent documents (for dashboard)
   * @param {number} limit - Number of documents to retrieve
   * @returns {Promise<Array>} Array of recent documents
   */
  async getRecentDocuments(limit = 10) {
    try {
      const docsSnap = await this.documentsCollection
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const documents = [];
      docsSnap.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return documents;
    } catch (error) {
      logger.error('Error getting recent documents from Firestore:', error);
      return [];
    }
  }

  /**
   * Search documents by text content
   * @param {string} searchTerm - Search term
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of matching documents
   */
  async searchDocuments(searchTerm, limit = 10) {
    try {
      // Note: For production, consider using Algolia or Elasticsearch for better text search
      const docsSnap = await this.documentsCollection
        .where('originalName', '>=', searchTerm)
        .where('originalName', '<=', searchTerm + '\uf8ff')
        .limit(limit)
        .get();
      
      const documents = [];
      docsSnap.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return documents;
    } catch (error) {
      logger.error('Error searching documents in Firestore:', error);
      return [];
    }
  }
}

module.exports = new FirestoreService();

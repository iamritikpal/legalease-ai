const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class CloudStorageService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    this.bucketName = process.env.GCS_BUCKET_NAME;
    this.bucket = this.storage.bucket(this.bucketName);
  }

  /**
   * Upload a file to Google Cloud Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Upload result with file URL and metadata
   */
  async uploadFile(fileBuffer, originalName, mimeType) {
    try {
      const fileId = uuidv4();
      const fileExtension = originalName.split('.').pop();
      const fileName = `documents/${fileId}.${fileExtension}`;
      
      const file = this.bucket.file(fileName);
      
      const metadata = {
        metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          fileId,
        },
        contentType: mimeType,
      };

      // Upload file with encryption
      await file.save(fileBuffer, {
        metadata,
        resumable: false,
        validation: 'crc32c',
      });

      // Make file temporarily accessible (for processing)
      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
      
      logger.info(`File uploaded successfully: ${fileName}`);
      
      return {
        fileId,
        fileName,
        originalName,
        publicUrl,
        size: fileBuffer.length,
        mimeType,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error uploading file to Cloud Storage:', error);
      throw new Error('Failed to upload file to cloud storage');
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param {string} fileName - Name of file to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(fileName) {
    try {
      await this.bucket.file(fileName).delete();
      logger.info(`File deleted successfully: ${fileName}`);
      return true;
    } catch (error) {
      logger.error('Error deleting file from Cloud Storage:', error);
      return false;
    }
  }

  /**
   * Get signed URL for temporary access
   * @param {string} fileName - Name of file
   * @param {number} expirationMinutes - URL expiration in minutes
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(fileName, expirationMinutes = 60) {
    try {
      const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + expirationMinutes * 60 * 1000,
      };

      const [url] = await this.bucket.file(fileName).getSignedUrl(options);
      return url;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw new Error('Failed to generate file access URL');
    }
  }

  /**
   * Check if bucket exists and create if it doesn't
   * @returns {Promise<boolean>} Success status
   */
  async ensureBucketExists() {
    try {
      const [exists] = await this.bucket.exists();
      
      if (!exists) {
        await this.storage.createBucket(this.bucketName, {
          location: process.env.GCS_REGION || 'us-central1',
          storageClass: 'STANDARD',
        });
        logger.info(`Bucket created: ${this.bucketName}`);
      }
      
      return true;
    } catch (error) {
      logger.error('Error ensuring bucket exists:', error);
      return false;
    }
  }
}

module.exports = new CloudStorageService();

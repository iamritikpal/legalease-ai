#!/usr/bin/env node

/**
 * Vertex AI Connection Test Script
 * 
 * This script tests the Vertex AI connection and identifies why it's falling back.
 * Run with: node test-vertex-ai.js
 */

const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class VertexAITester {
  constructor() {
    this.results = {
      environment: {},
      credentials: {},
      api: {},
      model: {},
      connection: {},
      summary: {}
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(`  ${title}`, 'bright');
    this.log(`${'='.repeat(60)}`, 'cyan');
  }

  logTest(testName, status, details = '') {
    const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
    const statusSymbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
    
    this.log(`  ${statusSymbol} ${testName}: ${status}`, statusColor);
    if (details) {
      this.log(`    ${details}`, 'yellow');
    }
  }

  async testEnvironmentVariables() {
    this.logSection('ENVIRONMENT VARIABLES TEST');
    
    const requiredVars = [
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'VERTEX_AI_LOCATION',
      'VERTEX_AI_MODEL'
    ];

    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        this.logTest(varName, 'PASS', `Set to: ${value}`);
        this.results.environment[varName] = { status: 'PASS', value };
      } else {
        this.logTest(varName, 'FAIL', 'Not set');
        this.results.environment[varName] = { status: 'FAIL', value: null };
      }
    }

    // Test default values
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const model = process.env.VERTEX_AI_MODEL || 'gemini-pro';

    this.logTest('Project ID Format', projectId && projectId.includes('-') ? 'PASS' : 'WARN', 
      projectId ? 'Valid format' : 'Missing or invalid format');
    
    this.logTest('Location', location ? 'PASS' : 'WARN', `Using: ${location}`);
    this.logTest('Model', model ? 'PASS' : 'WARN', `Using: ${model}`);
  }

  async testCredentials() {
    this.logSection('CREDENTIALS TEST');
    
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentialsPath) {
      this.logTest('Credentials Path', 'FAIL', 'GOOGLE_APPLICATION_CREDENTIALS not set');
      this.results.credentials.path = { status: 'FAIL' };
      return;
    }

    // Test if file exists
    if (fs.existsSync(credentialsPath)) {
      this.logTest('Credentials File', 'PASS', `Found at: ${credentialsPath}`);
      this.results.credentials.path = { status: 'PASS', path: credentialsPath };
    } else {
      this.logTest('Credentials File', 'FAIL', `File not found: ${credentialsPath}`);
      this.results.credentials.path = { status: 'FAIL', path: credentialsPath };
      return;
    }

    // Test if file is readable
    try {
      const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
      const credentials = JSON.parse(credentialsContent);
      
      this.logTest('Credentials Format', 'PASS', 'Valid JSON format');
      this.results.credentials.format = { status: 'PASS' };

      // Check required fields
      const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
      for (const field of requiredFields) {
        if (credentials[field]) {
          this.logTest(`Credentials.${field}`, 'PASS', 'Present');
          this.results.credentials[field] = { status: 'PASS' };
        } else {
          this.logTest(`Credentials.${field}`, 'FAIL', 'Missing');
          this.results.credentials[field] = { status: 'FAIL' };
        }
      }

      // Test service account email format
      if (credentials.client_email && credentials.client_email.includes('@')) {
        this.logTest('Service Account Email', 'PASS', credentials.client_email);
        this.results.credentials.email = { status: 'PASS', value: credentials.client_email };
      } else {
        this.logTest('Service Account Email', 'FAIL', 'Invalid email format');
        this.results.credentials.email = { status: 'FAIL' };
      }

    } catch (error) {
      this.logTest('Credentials Parse', 'FAIL', `Error: ${error.message}`);
      this.results.credentials.parse = { status: 'FAIL', error: error.message };
    }
  }

  async testAPIConnection() {
    this.logSection('API CONNECTION TEST');
    
    try {
      const client = new PredictionServiceClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      this.logTest('Client Creation', 'PASS', 'PredictionServiceClient created successfully');
      this.results.api.client = { status: 'PASS' };

      // Test basic connectivity with a simple request
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      const model = process.env.VERTEX_AI_MODEL || 'gemini-pro';
      
      const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${model}`;
      
      this.logTest('Endpoint Construction', 'PASS', `Endpoint: ${endpoint}`);
      this.results.api.endpoint = { status: 'PASS', endpoint };

    } catch (error) {
      this.logTest('Client Creation', 'FAIL', `Error: ${error.message}`);
      this.results.api.client = { status: 'FAIL', error: error.message };
    }
  }

  async testModelAvailability() {
    this.logSection('MODEL AVAILABILITY TEST');
    
    try {
      const client = new PredictionServiceClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      const model = process.env.VERTEX_AI_MODEL || 'gemini-pro';
      
      const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${model}`;

      // Test with a minimal request
      const instanceValue = {
        contents: [{
          role: 'user',
          parts: [{
            text: 'Hello, this is a test message.'
          }]
        }],
        generation_config: {
          temperature: 0.1,
          max_output_tokens: 100,
        }
      };

      const request = {
        endpoint,
        instances: [instanceValue],
      };

      this.log('  Testing model availability...', 'yellow');
      
      const [response] = await client.predict(request);
      
      if (response && response.predictions && response.predictions.length > 0) {
        this.logTest('Model Response', 'PASS', 'Model is accessible and responding');
        this.results.model.response = { status: 'PASS' };
        
        const prediction = response.predictions[0];
        if (prediction.candidates && prediction.candidates.length > 0) {
          this.logTest('Response Format', 'PASS', 'Valid response format received');
          this.results.model.format = { status: 'PASS' };
        } else {
          this.logTest('Response Format', 'WARN', 'Unexpected response format');
          this.results.model.format = { status: 'WARN' };
        }
      } else {
        this.logTest('Model Response', 'FAIL', 'No predictions returned');
        this.results.model.response = { status: 'FAIL' };
      }

    } catch (error) {
      this.logTest('Model Test', 'FAIL', `Error: ${error.message}`);
      this.results.model.test = { status: 'FAIL', error: error.message };
      
      // Analyze specific error types
      if (error.code === 7 || error.message.includes('PERMISSION_DENIED')) {
        this.logTest('Permission Error', 'FAIL', 'Permission denied - check IAM roles');
        this.results.model.permissions = { status: 'FAIL' };
      } else if (error.message.includes('NOT_FOUND')) {
        this.logTest('Resource Error', 'FAIL', 'Model or endpoint not found');
        this.results.model.resource = { status: 'FAIL' };
      } else if (error.message.includes('UNAVAILABLE')) {
        this.logTest('Service Error', 'FAIL', 'Vertex AI service unavailable');
        this.results.model.service = { status: 'FAIL' };
      }
    }
  }

  async testFullConnection() {
    this.logSection('FULL CONNECTION TEST');
    
    try {
      const client = new PredictionServiceClient({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
      const model = process.env.VERTEX_AI_MODEL || 'gemini-pro';
      
      const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${model}`;

      // Test with a realistic prompt similar to the application
      const instanceValue = {
        contents: [{
          role: 'user',
          parts: [{
            text: 'Analyze this legal document and provide a summary: "This is a test contract between Party A and Party B for the provision of services."'
          }]
        }],
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 500,
          top_p: 0.8,
          top_k: 40
        },
        safety_settings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const request = {
        endpoint,
        instances: [instanceValue],
      };

      this.log('  Testing full connection with realistic prompt...', 'yellow');
      
      const startTime = Date.now();
      const [response] = await client.predict(request);
      const endTime = Date.now();
      
      this.logTest('Full Connection', 'PASS', `Response time: ${endTime - startTime}ms`);
      this.results.connection.full = { status: 'PASS', responseTime: endTime - startTime };
      
      if (response && response.predictions && response.predictions.length > 0) {
        const prediction = response.predictions[0];
        if (prediction.candidates && prediction.candidates.length > 0) {
          const candidate = prediction.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const responseText = candidate.content.parts[0].text;
            this.logTest('Response Content', 'PASS', `Received ${responseText.length} characters`);
            this.results.connection.content = { status: 'PASS', length: responseText.length };
            
            // Show a preview of the response
            this.log(`\n  Response Preview:`, 'green');
            this.log(`  ${responseText.substring(0, 200)}...`, 'yellow');
          } else {
            this.logTest('Response Content', 'FAIL', 'No content in response');
            this.results.connection.content = { status: 'FAIL' };
          }
        } else {
          this.logTest('Response Content', 'FAIL', 'No candidates in response');
          this.results.connection.content = { status: 'FAIL' };
        }
      } else {
        this.logTest('Response Structure', 'FAIL', 'Invalid response structure');
        this.results.connection.structure = { status: 'FAIL' };
      }

    } catch (error) {
      this.logTest('Full Connection', 'FAIL', `Error: ${error.message}`);
      this.results.connection.full = { status: 'FAIL', error: error.message };
    }
  }

  generateSummary() {
    this.logSection('DIAGNOSTIC SUMMARY');
    
    const issues = [];
    const warnings = [];
    const solutions = [];

    // Check environment variables
    const envVars = this.results.environment;
    if (!envVars.GOOGLE_CLOUD_PROJECT_ID?.status === 'PASS') {
      issues.push('GOOGLE_CLOUD_PROJECT_ID not set');
      solutions.push('Set GOOGLE_CLOUD_PROJECT_ID environment variable');
    }
    if (!envVars.GOOGLE_APPLICATION_CREDENTIALS?.status === 'PASS') {
      issues.push('GOOGLE_APPLICATION_CREDENTIALS not set');
      solutions.push('Set GOOGLE_APPLICATION_CREDENTIALS to path of service account key file');
    }

    // Check credentials
    const creds = this.results.credentials;
    if (creds.path?.status === 'FAIL') {
      issues.push('Service account key file not found');
      solutions.push('Download service account key from Google Cloud Console');
    }
    if (creds.format?.status === 'FAIL') {
      issues.push('Invalid service account key format');
      solutions.push('Ensure service account key is valid JSON');
    }

    // Check API connection
    const api = this.results.api;
    if (api.client?.status === 'FAIL') {
      issues.push('Cannot create Vertex AI client');
      solutions.push('Check credentials and network connectivity');
    }

    // Check model
    const model = this.results.model;
    if (model.response?.status === 'FAIL') {
      issues.push('Model not accessible');
      solutions.push('Enable Vertex AI API and check model availability');
    }
    if (model.permissions?.status === 'FAIL') {
      issues.push('Permission denied');
      solutions.push('Add Vertex AI User role to service account');
    }

    // Check full connection
    const connection = this.results.connection;
    if (connection.full?.status === 'FAIL') {
      issues.push('Full connection test failed');
      solutions.push('Check all previous issues and retry');
    }

    if (issues.length === 0) {
      this.log('🎉 ALL TESTS PASSED! Vertex AI is properly configured.', 'green');
    } else {
      this.log('❌ ISSUES FOUND:', 'red');
      issues.forEach((issue, index) => {
        this.log(`  ${index + 1}. ${issue}`, 'red');
      });
      
      this.log('\n🔧 SOLUTIONS:', 'yellow');
      solutions.forEach((solution, index) => {
        this.log(`  ${index + 1}. ${solution}`, 'yellow');
      });
    }

    // Generate detailed report
    this.log('\n📋 DETAILED REPORT:', 'cyan');
    this.log(`  Environment Variables: ${Object.values(envVars).filter(v => v?.status === 'PASS').length}/${Object.values(envVars).length} passed`);
    this.log(`  Credentials: ${Object.values(creds).filter(v => v?.status === 'PASS').length}/${Object.values(creds).length} passed`);
    this.log(`  API Connection: ${Object.values(api).filter(v => v?.status === 'PASS').length}/${Object.values(api).length} passed`);
    this.log(`  Model: ${Object.values(model).filter(v => v?.status === 'PASS').length}/${Object.values(model).length} passed`);
    this.log(`  Full Connection: ${Object.values(connection).filter(v => v?.status === 'PASS').length}/${Object.values(connection).length} passed`);

    return {
      issues,
      solutions,
      results: this.results
    };
  }

  async runAllTests() {
    this.log('🚀 Starting Vertex AI Connection Diagnostics...', 'bright');
    
    await this.testEnvironmentVariables();
    await this.testCredentials();
    await this.testAPIConnection();
    await this.testModelAvailability();
    await this.testFullConnection();
    
    const summary = this.generateSummary();
    
    // Save results to file
    const reportPath = path.join(__dirname, 'vertex-ai-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
    
    return summary;
  }
}

// Run the tests
if (require.main === module) {
  const tester = new VertexAITester();
  tester.runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = VertexAITester;

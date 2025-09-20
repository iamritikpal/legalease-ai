#!/usr/bin/env node

/**
 * Test Vertex AI Generative Service for Gemini models
 */

require('dotenv').config();
const { VertexAI } = require('@google-cloud/vertexai');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testVertexAIGenerative() {
  log('🧪 Testing Vertex AI Generative Service', 'cyan');
  log('=====================================\n');
  
  // Check environment
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
  const model = process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash';
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!projectId) {
    log('❌ GOOGLE_CLOUD_PROJECT_ID not set', 'red');
    return false;
  }
  
  if (!credentialsPath) {
    log('❌ GOOGLE_APPLICATION_CREDENTIALS not set', 'red');
    return false;
  }
  
  log(`✅ Project: ${projectId}`, 'green');
  log(`✅ Location: ${location}`, 'green');
  log(`✅ Model: ${model}`, 'green');
  log(`✅ Credentials: ${credentialsPath}`, 'green');
  
  try {
    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
      keyFilename: credentialsPath,
    });
    
    log('\n🧪 Testing Vertex AI initialization...', 'yellow');
    log('✅ Vertex AI client created successfully', 'green');
    
    // Get the generative model
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 100
      }
    });
    
    log('✅ Generative model initialized successfully', 'green');
    
    // Test basic generation
    log('\n🧪 Testing basic content generation...', 'yellow');
    
    const result = await generativeModel.generateContent('Hello, this is a test. Please respond with "Test successful".');
    const response = await result.response;
    
    // Extract text from the response
    let text = '';
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        text = candidate.content.parts[0].text;
      }
    }
    
    log('✅ Content generation successful!', 'green');
    log(`📝 Response: ${text}`, 'cyan');
    
    // Test with legal document prompt
    log('\n🧪 Testing legal document analysis...', 'yellow');
    
    const legalPrompt = `
Analyze this legal document and provide a summary:

"This is a test contract between Party A and Party B for the provision of services. The contract shall be effective from January 1, 2024, and shall continue for a period of one year. Party A agrees to provide consulting services to Party B in exchange for a monthly fee of $5,000."

Please provide a brief summary of the key terms.
`;
    
    const legalResult = await generativeModel.generateContent(legalPrompt);
    const legalResponse = await legalResult.response;
    
    // Extract text from the response
    let legalText = '';
    if (legalResponse.candidates && legalResponse.candidates.length > 0) {
      const candidate = legalResponse.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        legalText = candidate.content.parts[0].text;
      }
    }
    
    log('✅ Legal document analysis successful!', 'green');
    log(`📝 Analysis: ${legalText.substring(0, 200)}...`, 'cyan');
    
    log('\n🎉 All tests passed! Vertex AI Generative Service is working correctly.', 'green');
    log('Your application should now use real AI responses instead of fallback text.', 'green');
    
    return true;
    
  } catch (error) {
    log(`❌ Vertex AI Generative Service test failed: ${error.message}`, 'red');
    
    if (error.message.includes('PERMISSION_DENIED')) {
      log('🔧 Solution: Check IAM permissions for your service account', 'yellow');
      log('Required roles: Vertex AI User, AI Platform User', 'yellow');
    } else if (error.message.includes('NOT_FOUND')) {
      log('🔧 Solution: Enable Vertex AI API in Google Cloud Console', 'yellow');
    } else if (error.message.includes('UNAVAILABLE')) {
      log('🔧 Solution: Check if Vertex AI API is enabled and billing is set up', 'yellow');
    }
    
    return false;
  }
}

async function testVertexAIService() {
  log('\n🔧 Testing Vertex AI Service Integration', 'cyan');
  log('========================================\n');
  
  try {
    const VertexAIService = require('./services/vertexAI');
    
    log('🧪 Testing document summary...', 'yellow');
    
    const testDocument = `
This is a test legal contract between John Doe (Party A) and Jane Smith (Party B) for the provision of web development services. The contract shall be effective from January 1, 2024, and shall continue for a period of six months. Party A agrees to provide web development services to Party B in exchange for a total fee of $30,000, payable in monthly installments of $5,000. The contract may be terminated by either party with 30 days written notice.
`;
    
    const summary = await VertexAIService.generateSummary(testDocument, 'en');
    
    if (summary && summary.summary && !summary.summary.includes('VERTEX AI') && !summary.summary.includes('CONFIGURATION')) {
      log('✅ Vertex AI Service working with real AI responses!', 'green');
      log(`📝 Summary preview: ${summary.summary.substring(0, 200)}...`, 'cyan');
      return true;
    } else {
      log('❌ Vertex AI Service still using fallback responses', 'red');
      log(`📝 Response: ${summary.summary.substring(0, 200)}...`, 'yellow');
      return false;
    }
    
  } catch (error) {
    log(`❌ Vertex AI Service test failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Vertex AI Generative Service Test', 'cyan');
  log('===================================\n');
  
  const generativeTest = await testVertexAIGenerative();
  const serviceTest = await testVertexAIService();
  
  log('\n📊 Test Results:', 'cyan');
  log(`  Vertex AI Generative Service: ${generativeTest ? '✅ PASS' : '❌ FAIL'}`, generativeTest ? 'green' : 'red');
  log(`  Vertex AI Service Integration: ${serviceTest ? '✅ PASS' : '❌ FAIL'}`, serviceTest ? 'green' : 'red');
  
  if (generativeTest && serviceTest) {
    log('\n🎉 All tests passed! Your application is ready to use real AI responses.', 'green');
    log('No more "Using fallback response" warnings!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});

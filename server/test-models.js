#!/usr/bin/env node

/**
 * Test different Vertex AI models to find the correct one
 */

require('dotenv').config();
const { PredictionServiceClient } = require('@google-cloud/aiplatform');

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

async function testModel(modelName, location = 'us-central1') {
  try {
    const client = new PredictionServiceClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    const endpoint = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/${location}/publishers/google/models/${modelName}`;
    
    const instanceValue = {
      contents: [{
        role: 'user',
        parts: [{
          text: 'Hello, this is a test.'
        }]
      }],
      generation_config: {
        temperature: 0.1,
        max_output_tokens: 50,
      }
    };

    const request = {
      endpoint,
      instances: [instanceValue],
    };

    log(`Testing model: ${modelName}`, 'cyan');
    const [response] = await client.predict(request);
    
    if (response && response.predictions && response.predictions.length > 0) {
      log(`✅ ${modelName} - WORKING!`, 'green');
      return true;
    } else {
      log(`❌ ${modelName} - No response`, 'red');
      return false;
    }
    
  } catch (error) {
    if (error.message.includes('NOT_FOUND')) {
      log(`❌ ${modelName} - Model not found`, 'red');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      log(`❌ ${modelName} - Permission denied`, 'red');
    } else if (error.message.includes('UNAVAILABLE')) {
      log(`❌ ${modelName} - Service unavailable`, 'red');
    } else {
      log(`❌ ${modelName} - Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testLocations() {
  const locations = ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'asia-southeast1'];
  const models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.0-pro', 'text-bison', 'text-bison-32k'];
  
  log('🔍 Testing different models and locations...\n', 'cyan');
  
  for (const location of locations) {
    log(`\n📍 Testing location: ${location}`, 'yellow');
    log('='.repeat(50), 'yellow');
    
    for (const model of models) {
      await testModel(model, location);
    }
  }
}

async function checkAPIs() {
  log('\n🔧 Checking API Requirements...', 'cyan');
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  log(`\n📋 Required APIs for project: ${projectId}`, 'yellow');
  log('1. Vertex AI API (aiplatform.googleapis.com)', 'yellow');
  log('2. AI Platform API (ml.googleapis.com)', 'yellow');
  log('3. Generative AI API (generativelanguage.googleapis.com)', 'yellow');
  
  log('\n🔗 Enable APIs at:', 'cyan');
  log(`https://console.cloud.google.com/apis/library?project=${projectId}`, 'cyan');
  
  log('\n👤 Required IAM Roles for service account:', 'yellow');
  log('1. Vertex AI User (roles/aiplatform.user)', 'yellow');
  log('2. AI Platform User (roles/ml.developer)', 'yellow');
  log('3. Generative AI User (roles/generativelanguage.user)', 'yellow');
  
  log('\n🔗 Manage IAM at:', 'cyan');
  log(`https://console.cloud.google.com/iam-admin/iam?project=${projectId}`, 'cyan');
}

async function main() {
  log('🚀 Vertex AI Model Testing', 'cyan');
  log('========================\n');
  
  // Check if environment is set up
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    log('❌ GOOGLE_CLOUD_PROJECT_ID not set', 'red');
    return;
  }
  
  log(`Project: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`, 'green');
  log(`Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`, 'green');
  
  await checkAPIs();
  await testLocations();
  
  log('\n🎯 Recommendations:', 'cyan');
  log('1. Enable all required APIs in Google Cloud Console', 'yellow');
  log('2. Add required IAM roles to your service account', 'yellow');
  log('3. Try the working model in your application', 'yellow');
  log('4. Update VERTEX_AI_MODEL in .env file if needed', 'yellow');
}

main().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

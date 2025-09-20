#!/usr/bin/env node

/**
 * Fix Vertex AI Configuration Script
 * This script sets up the environment variables and tests the connection
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Vertex AI Configuration...\n');

// Create .env file content
const envContent = `# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=h2skill-472620
GOOGLE_APPLICATION_CREDENTIALS=./service_account_key.json
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro

# Other environment variables
NODE_ENV=development
PORT=5000
`;

// Write .env file
const envPath = path.join(__dirname, '.env');
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file with correct configuration');
  console.log(`📄 Location: ${envPath}`);
} catch (error) {
  console.log(`❌ Error creating .env file: ${error.message}`);
  console.log('Please create the .env file manually with the following content:');
  console.log('\n' + '='.repeat(50));
  console.log(envContent);
  console.log('='.repeat(50));
}

// Test the configuration
console.log('\n🧪 Testing configuration...\n');

// Load environment variables
require('dotenv').config();

console.log('Current Environment:');
console.log(`  GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT SET'}`);
console.log(`  GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET'}`);
console.log(`  VERTEX_AI_LOCATION: ${process.env.VERTEX_AI_LOCATION || 'NOT SET'}`);
console.log(`  VERTEX_AI_MODEL: ${process.env.VERTEX_AI_MODEL || 'NOT SET'}`);

// Check if service account key exists
const credentialsPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || './service_account_key.json');
if (fs.existsSync(credentialsPath)) {
  console.log(`✅ Service account key found: ${credentialsPath}`);
  
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log(`✅ Service account: ${credentials.client_email}`);
    console.log(`✅ Project ID in key: ${credentials.project_id}`);
  } catch (error) {
    console.log(`❌ Error reading service account key: ${error.message}`);
  }
} else {
  console.log(`❌ Service account key not found: ${credentialsPath}`);
}

console.log('\n🚀 Next Steps:');
console.log('1. Make sure Vertex AI API is enabled in Google Cloud Console');
console.log('2. Ensure your service account has these roles:');
console.log('   - Vertex AI User (roles/aiplatform.user)');
console.log('   - AI Platform User (roles/ml.developer)');
console.log('3. Run: node test-vertex-ai.js to test the connection');
console.log('4. If tests pass, restart your application');

console.log('\n📋 Quick Test:');
console.log('Run this command to test: node test-vertex-ai.js');

#!/usr/bin/env node

/**
 * Environment Setup Helper for Vertex AI
 * This script helps set up the required environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 Vertex AI Environment Setup');
  console.log('==============================\n');
  
  console.log('This script will help you set up the required environment variables for Vertex AI.\n');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log('📄 Found existing .env file');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('\nPlease provide the following information:\n');
  
  // Get Google Cloud Project ID
  const projectId = await question('1. Google Cloud Project ID (e.g., my-project-123): ');
  if (!projectId.trim()) {
    console.log('❌ Project ID is required!');
    rl.close();
    return;
  }
  
  // Get service account key path
  const credentialsPath = await question('2. Path to service account key file (e.g., ./service_account_key.json): ');
  if (!credentialsPath.trim()) {
    console.log('❌ Credentials path is required!');
    rl.close();
    return;
  }
  
  // Check if credentials file exists
  const fullCredentialsPath = path.resolve(credentialsPath);
  if (!fs.existsSync(fullCredentialsPath)) {
    console.log(`⚠️  Warning: Credentials file not found at ${fullCredentialsPath}`);
    const continueAnyway = await question('Continue anyway? (y/N): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Get optional settings
  const location = await question('3. Vertex AI Location (default: us-central1): ') || 'us-central1';
  const model = await question('4. Vertex AI Model (default: gemini-pro): ') || 'gemini-pro';
  
  // Create .env content
  const envContent = `# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=${projectId.trim()}
GOOGLE_APPLICATION_CREDENTIALS=${path.resolve(credentialsPath.trim())}
VERTEX_AI_LOCATION=${location.trim()}
VERTEX_AI_MODEL=${model.trim()}

# Other environment variables (add as needed)
NODE_ENV=development
PORT=5000
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log(`📄 Location: ${envPath}`);
    
    console.log('\n📋 Configuration Summary:');
    console.log(`  Project ID: ${projectId.trim()}`);
    console.log(`  Credentials: ${path.resolve(credentialsPath.trim())}`);
    console.log(`  Location: ${location.trim()}`);
    console.log(`  Model: ${model.trim()}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Make sure your service account has the required permissions:');
    console.log('   - Vertex AI User');
    console.log('   - AI Platform User');
    console.log('   - ML Developer');
    console.log('2. Enable the Vertex AI API in your Google Cloud Console');
    console.log('3. Run: node run-vertex-test.js to test the connection');
    
  } catch (error) {
    console.log(`❌ Error creating .env file: ${error.message}`);
  }
  
  rl.close();
}

// Run setup
setupEnvironment().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});

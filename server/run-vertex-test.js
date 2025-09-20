#!/usr/bin/env node

/**
 * Quick script to run Vertex AI diagnostics
 */

require('dotenv').config();
const VertexAITester = require('./test-vertex-ai');

console.log('🔍 LegalEase AI - Vertex AI Connection Diagnostics');
console.log('================================================\n');

// Show current environment
console.log('Current Environment:');
console.log(`  GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT SET'}`);
console.log(`  GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET'}`);
console.log(`  VERTEX_AI_LOCATION: ${process.env.VERTEX_AI_LOCATION || 'us-central1 (default)'}`);
console.log(`  VERTEX_AI_MODEL: ${process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash (default)'}`);
console.log('');

// Run the tests
const tester = new VertexAITester();
tester.runAllTests().then(summary => {
  console.log('\n🏁 Diagnostics Complete!');
  
  if (summary.issues.length === 0) {
    console.log('✅ Vertex AI is properly configured and working!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${summary.issues.length} issues that need to be resolved.`);
    console.log('Please fix the issues above and run this test again.');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});

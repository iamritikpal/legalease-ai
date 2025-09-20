# Vertex AI Setup Guide

## 🚨 Current Issue: Vertex AI Fallback

Your application is currently falling back to static responses because Vertex AI is not properly configured. Here's how to fix it:

## 🔍 Diagnostic Results

Based on the test results, the main issues are:

1. **Environment Variables Not Set** - Required environment variables are missing
2. **Credentials Not Configured** - Service account credentials not properly linked
3. **API Permissions** - Service account may lack required permissions

## 🛠️ Step-by-Step Fix

### Step 1: Set Up Environment Variables

Create a `.env` file in the `server` directory with the following content:

```bash
# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
GOOGLE_APPLICATION_CREDENTIALS=./service_account_key.json
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro

# Other environment variables
NODE_ENV=development
PORT=5000
```

**Replace `your-project-id-here` with your actual Google Cloud Project ID.**

### Step 2: Verify Service Account Key

The test found a `service_account_key.json` file. Verify it contains:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 3: Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Library"
4. Enable these APIs:
   - **Vertex AI API** (aiplatform.googleapis.com)
   - **AI Platform API** (ml.googleapis.com)

### Step 4: Configure Service Account Permissions

1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account (usually ends with `@your-project.iam.gserviceaccount.com`)
3. Click "Edit" (pencil icon)
4. Add these roles:
   - **Vertex AI User** (`roles/aiplatform.user`)
   - **AI Platform User** (`roles/ml.developer`)
   - **ML Developer** (`roles/ml.developer`)

### Step 5: Test the Configuration

Run the diagnostic script to verify everything is working:

```bash
cd server
node test-vertex-ai.js
```

You should see all tests passing with green checkmarks.

## 🚀 Quick Setup Script

You can also use the automated setup script:

```bash
cd server
node setup-vertex-env.js
```

This will guide you through setting up the environment variables interactively.

## 🔧 Troubleshooting

### Common Issues:

1. **"Could not load the default credentials"**
   - Check that `GOOGLE_APPLICATION_CREDENTIALS` points to the correct file
   - Verify the service account key file is valid JSON
   - Ensure the file path is correct (use absolute path if needed)

2. **"Permission denied"**
   - Add the required IAM roles to your service account
   - Wait a few minutes for permissions to propagate

3. **"Model not found"**
   - Verify the model name is correct (`gemini-pro`)
   - Check that Vertex AI API is enabled
   - Ensure you're using the correct region

4. **"Project not found"**
   - Verify the project ID is correct
   - Check that the service account belongs to the right project

### Test Commands:

```bash
# Test environment setup
node run-vertex-test.js

# Run full diagnostics
node test-vertex-ai.js

# Check current environment
node -e "console.log(process.env.GOOGLE_CLOUD_PROJECT_ID)"
```

## 📋 Verification Checklist

- [ ] `.env` file created with correct values
- [ ] Service account key file exists and is valid
- [ ] Vertex AI API enabled in Google Cloud Console
- [ ] Service account has required IAM roles
- [ ] Diagnostic test passes with all green checkmarks
- [ ] Application no longer shows "fallback response" warnings

## 🎯 Expected Result

Once properly configured, you should see:

```
✅ ALL TESTS PASSED! Vertex AI is properly configured.
```

And your application will use real AI responses instead of fallback text.

## 📞 Need Help?

If you're still having issues:

1. Check the detailed report: `server/vertex-ai-test-report.json`
2. Verify all environment variables are set correctly
3. Ensure your Google Cloud project has billing enabled
4. Check that the service account key hasn't expired

The diagnostic script will provide specific error messages to help identify the exact issue.

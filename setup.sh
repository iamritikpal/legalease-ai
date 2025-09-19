#!/bin/bash

# LegalEase AI Setup Script
# This script helps set up the LegalEase AI application

set -e

echo "🚀 LegalEase AI Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        if [[ $(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
            print_warning "Node.js version 18 or higher is recommended"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    print_status "Dependencies installed successfully"
}

# Create environment file
create_env_file() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f "server/.env" ]; then
        cp server/config.example.env server/.env
        print_status "Environment file created at server/.env"
        print_warning "Please edit server/.env with your Google Cloud configuration"
    else
        print_warning "Environment file already exists at server/.env"
    fi
}

# Create logs directory
create_logs_dir() {
    mkdir -p server/logs
    print_status "Logs directory created"
}

# Check Google Cloud CLI
check_gcloud() {
    if command -v gcloud &> /dev/null; then
        print_status "Google Cloud CLI is installed"
    else
        print_warning "Google Cloud CLI is not installed"
        print_info "Install from: https://cloud.google.com/sdk/docs/install"
    fi
}

# Check PM2 (optional)
check_pm2() {
    if command -v pm2 &> /dev/null; then
        print_status "PM2 is installed (optional for production)"
    else
        print_info "PM2 not installed (optional for production process management)"
        print_info "Install with: npm install -g pm2"
    fi
}

# Display setup instructions
display_instructions() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Set up Google Cloud Project:"
    echo "   - Create a new project or select existing one"
    echo "   - Enable required APIs (Document AI, Vertex AI, Storage, Firestore)"
    echo "   - Create service account and download key"
    echo "   - Create Document AI processor"
    echo "   - Create Cloud Storage bucket"
    echo ""
    echo "2. Configure environment variables in server/.env:"
    echo "   - GOOGLE_CLOUD_PROJECT_ID"
    echo "   - DOCUMENT_AI_PROCESSOR_ID"
    echo "   - GCS_BUCKET_NAME"
    echo "   - Place service-account-key.json in server/ directory"
    echo ""
    echo "3. Start development server:"
    echo "   npm run dev"
    echo ""
    echo "4. For production deployment:"
    echo "   npm run build && npm start"
    echo "   # Or use PM2: pm2 start server/index.js --name legalease-ai"
    echo ""
    echo "5. Open http://localhost:3000 in your browser"
    echo ""
    echo "For detailed setup instructions, see README.md"
}

# Main setup process
main() {
    echo "Checking prerequisites..."
    check_nodejs
    check_npm
    check_gcloud
    check_pm2
    
    echo ""
    echo "Installing application..."
    install_dependencies
    create_env_file
    create_logs_dir
    
    display_instructions
}

# Run main function
main

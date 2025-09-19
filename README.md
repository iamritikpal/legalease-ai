# LegalEase AI

**Simplify Legal Documents with AI**

LegalEase AI is a comprehensive web application that uses Google Cloud's Generative AI stack to make legal documents accessible to everyone. Upload contracts, agreements, and legal documents to get plain-language summaries, risk analysis, and instant answers to your questions.

## 🚀 Features

### Core Functionality
- **Document Upload**: Support for PDF, images (JPEG, PNG), and text files
- **Text Extraction**: Advanced OCR using Google Cloud Document AI
- **AI Summarization**: Plain-language summaries using Vertex AI Gemini
- **Risk Analysis**: Identify red-flag clauses and potential risks
- **Interactive Q&A**: Ask questions and get instant, grounded answers
- **Bilingual Support**: Available in English and Hindi

### Technical Features
- **Secure Processing**: End-to-end encryption with automatic data deletion
- **Scalable Architecture**: Built on Google Cloud infrastructure
- **Real-time Processing**: Fast document analysis and response
- **Responsive Design**: Works on desktop and mobile devices
- **Privacy-First**: No permanent storage of sensitive documents

## 🏗️ Architecture

### Frontend
- **React 18** with modern hooks and context
- **TailwindCSS** for responsive, beautiful UI
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js/Express** RESTful API
- **Google Cloud Storage** for temporary file storage
- **Document AI** for text extraction and OCR
- **Vertex AI Gemini** for summarization and Q&A
- **Firestore** for session and metadata storage

### Cloud Services
- **Google Cloud Storage**: Document uploads and temporary storage
- **Document AI**: Advanced OCR and document structure analysis
- **Vertex AI**: Large language models for AI processing
- **Firestore**: NoSQL database for metadata and sessions
- **Cloud Functions**: Serverless processing triggers (optional)

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with billing enabled
- Google Cloud service account with appropriate permissions

### Google Cloud Setup

1. **Create a Google Cloud Project**
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**
   ```bash
   gcloud services enable documentai.googleapis.com
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable storage.googleapis.com
   gcloud services enable firestore.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   gcloud iam service-accounts create legalease-ai \
     --description="Service account for LegalEase AI" \
     --display-name="LegalEase AI"
   ```

4. **Grant Permissions**
   ```bash
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:legalease-ai@your-project-id.iam.gserviceaccount.com" \
     --role="roles/documentai.apiUser"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:legalease-ai@your-project-id.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:legalease-ai@your-project-id.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:legalease-ai@your-project-id.iam.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```

5. **Create and Download Service Account Key**
   ```bash
   gcloud iam service-accounts keys create service-account-key.json \
     --iam-account=legalease-ai@your-project-id.iam.gserviceaccount.com
   ```

6. **Create Document AI Processor**
   ```bash
   # Go to Cloud Console > Document AI > Create Processor
   # Choose "Document OCR" processor type
   # Note the processor ID for configuration
   ```

7. **Create Cloud Storage Bucket**
   ```bash
   gsutil mb gs://your-bucket-name
   gsutil uniformbucketlevelaccess set on gs://your-bucket-name
   ```

### Local Development Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd LegalEaseAI
   npm run install-all
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy example environment file
   cp server/config.example.env server/.env
   
   # Edit server/.env with your configuration
   ```

3. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # Google Cloud Configuration
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

   # Google Cloud Storage
   GCS_BUCKET_NAME=your-bucket-name
   GCS_REGION=us-central1

   # Document AI
   DOCUMENT_AI_PROCESSOR_ID=your-processor-id
   DOCUMENT_AI_LOCATION=us

   # Vertex AI
   VERTEX_AI_LOCATION=us-central1
   VERTEX_AI_MODEL=gemini-pro

   # Security
   JWT_SECRET=your-super-secret-jwt-key
   ENCRYPTION_KEY=your-32-character-encryption-key
   ```

4. **Place Service Account Key**
   ```bash
   # Place your service-account-key.json in the server directory
   mv service-account-key.json server/
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend development server on http://localhost:3000

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t legalease-ai .

# Run the container
docker run -d \
  --name legalease-ai \
  -p 5000:5000 \
  --env-file server/.env \
  -v $(pwd)/server/service-account-key.json:/app/service-account-key.json:ro \
  legalease-ai
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## 🌐 Production Deployment

### Google Cloud Run (Recommended)

1. **Build and Push to Container Registry**
   ```bash
   # Build and tag the image
   docker build -t gcr.io/your-project-id/legalease-ai .
   
   # Push to Google Container Registry
   docker push gcr.io/your-project-id/legalease-ai
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy legalease-ai \
     --image gcr.io/your-project-id/legalease-ai \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production \
     --set-env-vars GOOGLE_CLOUD_PROJECT_ID=your-project-id \
     --memory 2Gi \
     --cpu 2 \
     --max-instances 100
   ```

### Alternative Deployment Options

- **Google Kubernetes Engine (GKE)**
- **Google Compute Engine**
- **AWS ECS/EKS**
- **Azure Container Instances**
- **DigitalOcean App Platform**

## 📊 Monitoring and Logging

### Application Monitoring
- Health check endpoint: `/api/health`
- Structured logging with Winston
- Error tracking and reporting
- Performance metrics

### Google Cloud Monitoring
```bash
# Enable monitoring APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

## 🔒 Security Features

### Data Protection
- **Encryption in Transit**: TLS 1.3 for all communications
- **Encryption at Rest**: AES-256 encryption for stored data
- **Automatic Deletion**: Documents deleted within 24 hours
- **No Permanent Storage**: Temporary processing only

### Access Control
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configured for specific origins
- **Helmet.js**: Security headers and protection

### Compliance
- **GDPR Compliant**: European data protection standards
- **CCPA Compliant**: California privacy regulations
- **SOC 2**: System and organization controls
- **ISO 27001**: Information security management

## 🌍 Internationalization

Currently supported languages:
- **English (en)**: Full feature support
- **Hindi (hi)**: Full feature support

Adding new languages:
1. Add language configuration in `client/src/context/LanguageContext.js`
2. Add translations for UI elements
3. Update Vertex AI prompts for the new language
4. Test document processing in the target language

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# Integration tests
npm run test:integration
```

### Test Coverage
```bash
# Generate coverage reports
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation for API changes
- Follow semantic versioning for releases

## 📄 API Documentation

### Document Upload
```http
POST /api/documents/upload
Content-Type: multipart/form-data

{
  "document": file,
  "language": "en" | "hi"
}
```

### Ask Question
```http
POST /api/ai/question/:documentId
Content-Type: application/json

{
  "question": "What are the payment terms?",
  "language": "en" | "hi"
}
```

### Get Document
```http
GET /api/documents/:documentId
```

For complete API documentation, see the [API Reference](docs/api.md).

## 🐛 Troubleshooting

### Common Issues

**1. Google Cloud Authentication Error**
```bash
# Verify service account key path
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Test authentication
gcloud auth activate-service-account --key-file=service-account-key.json
```

**2. Document AI Processing Error**
- Verify Document AI API is enabled
- Check processor ID in environment variables
- Ensure service account has Document AI permissions

**3. File Upload Issues**
- Check file size limits (10MB max)
- Verify supported file types (PDF, JPEG, PNG, TXT)
- Ensure Cloud Storage bucket exists and is accessible

**4. Memory Issues**
- Increase Node.js memory limit: `--max-old-space-size=4096`
- Monitor memory usage in production
- Consider horizontal scaling for high traffic

### Logs and Debugging

```bash
# View application logs
tail -f server/logs/combined.log

# View error logs only
tail -f server/logs/error.log

# Docker logs
docker logs -f legalease-ai
```

## 📈 Performance Optimization

### Backend Optimizations
- Connection pooling for database connections
- Caching for frequently accessed data
- Compression for API responses
- Rate limiting to prevent abuse

### Frontend Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization
- Service worker for caching (optional)

### Google Cloud Optimizations
- Regional deployment for lower latency
- Auto-scaling based on traffic
- CDN for static assets
- Load balancing for high availability

## 📞 Support

### Documentation
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Email: support@legalease-ai.com

### Commercial Support
For enterprise support and custom deployments, contact us at enterprise@legalease-ai.com

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Cloud AI team for excellent documentation
- React and Node.js communities
- Open source contributors
- Legal professionals who provided domain expertise

---

**Disclaimer**: LegalEase AI is for informational purposes only and does not constitute legal advice. Always consult with qualified legal professionals for legal guidance.

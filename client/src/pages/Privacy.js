import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, Server, Globe } from 'lucide-react';

const Privacy = () => {
  const principles = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All documents are encrypted in transit and at rest using industry-standard encryption.',
    },
    {
      icon: Eye,
      title: 'No Permanent Storage',
      description: 'Documents are processed and deleted immediately. We don\'t store your files permanently.',
    },
    {
      icon: Trash2,
      title: 'Automatic Deletion',
      description: 'All processing data is automatically deleted within 24 hours of upload.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Built on Google Cloud\'s enterprise-grade security infrastructure.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Your privacy and data security are our top priorities. Here's how we protect your information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last updated: December 2024
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Privacy Principles
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built LegalEase AI with privacy by design, ensuring your sensitive documents remain secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {principle.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 lg:p-12"
          >
            <div className="prose prose-gray max-w-none">
              <h2>Information We Collect</h2>
              <p>
                When you use LegalEase AI, we may collect the following information:
              </p>
              <ul>
                <li><strong>Documents:</strong> Legal documents you upload for analysis (temporarily processed only)</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our service</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information for security purposes</li>
                <li><strong>Questions:</strong> Questions you ask about your documents (stored temporarily for context)</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>
                We use your information solely to provide our document analysis service:
              </p>
              <ul>
                <li>Process and analyze your legal documents</li>
                <li>Generate summaries and risk assessments</li>
                <li>Answer questions about your documents</li>
                <li>Improve our AI models (using anonymized data only)</li>
                <li>Ensure service security and prevent abuse</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement multiple layers of security to protect your data:
              </p>
              <ul>
                <li><strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3</li>
                <li><strong>Storage:</strong> Documents are encrypted at rest using AES-256</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can access data</li>
                <li><strong>Infrastructure:</strong> Built on Google Cloud's secure infrastructure</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for security threats</li>
              </ul>

              <h2>Data Retention</h2>
              <p>
                We believe in minimal data retention:
              </p>
              <ul>
                <li><strong>Documents:</strong> Automatically deleted within 24 hours of upload</li>
                <li><strong>Processing Results:</strong> Stored temporarily for your session, then deleted</li>
                <li><strong>Questions & Answers:</strong> Deleted when you close your session</li>
                <li><strong>Analytics Data:</strong> Anonymized usage statistics kept for service improvement</li>
              </ul>

              <h2>Third-Party Services</h2>
              <p>
                We use the following third-party services to provide our functionality:
              </p>
              <ul>
                <li><strong>Google Cloud AI:</strong> For document processing and AI analysis</li>
                <li><strong>Google Cloud Storage:</strong> For temporary document storage during processing</li>
                <li><strong>Google Cloud Firestore:</strong> For temporary session data</li>
              </ul>
              <p>
                All third-party services are bound by strict data processing agreements and comply with privacy regulations.
              </p>

              <h2>Your Rights</h2>
              <p>
                You have the following rights regarding your data:
              </p>
              <ul>
                <li><strong>Access:</strong> Request information about data we have about you</li>
                <li><strong>Deletion:</strong> Request deletion of your data (automatic in most cases)</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Portability:</strong> Request export of your data in a standard format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
              </ul>

              <h2>Cookies and Tracking</h2>
              <p>
                We use minimal cookies and tracking:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for service functionality</li>
                <li><strong>Analytics:</strong> Anonymous usage statistics to improve our service</li>
                <li><strong>No Advertising:</strong> We don't use advertising cookies or trackers</li>
              </ul>

              <h2>International Transfers</h2>
              <p>
                Your data may be processed in different countries where Google Cloud operates. 
                We ensure appropriate safeguards are in place for international data transfers, 
                including standard contractual clauses and adequacy decisions.
              </p>

              <h2>Children's Privacy</h2>
              <p>
                Our service is not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected 
                information from a child under 13, please contact us immediately.
              </p>

              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of 
                any material changes by posting the new policy on our website and updating 
                the "Last updated" date.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our data practices, 
                please contact us at:
              </p>
              <ul>
                <li>Email: privacy@legalease-ai.com</li>
                <li>Address: 123 Privacy Street, Secure City, SC 12345</li>
              </ul>

              <h2>Compliance</h2>
              <p>
                LegalEase AI complies with:
              </p>
              <ul>
                <li><strong>GDPR:</strong> European General Data Protection Regulation</li>
                <li><strong>CCPA:</strong> California Consumer Privacy Act</li>
                <li><strong>SOC 2:</strong> System and Organization Controls compliance</li>
                <li><strong>ISO 27001:</strong> Information security management standards</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Built with Security in Mind
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Enterprise Security
                </h3>
                <p className="text-gray-600">
                  Built on Google Cloud's enterprise-grade security infrastructure with 99.9% uptime SLA.
                </p>
              </div>

              <div className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Global Compliance
                </h3>
                <p className="text-gray-600">
                  Compliant with GDPR, CCPA, and other major privacy regulations worldwide.
                </p>
              </div>

              <div className="p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Zero Trust Architecture
                </h3>
                <p className="text-gray-600">
                  Every request is verified and encrypted, ensuring your data remains secure at all times.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Award, 
  Heart,
  CheckCircle,
  Star
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Privacy-First',
      description: 'Your documents are processed securely with end-to-end encryption and no permanent storage.',
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Leveraging Google Cloud\'s advanced AI models for accurate text extraction and analysis.',
    },
    {
      icon: Globe,
      title: 'Accessible',
      description: 'Available in multiple languages to serve diverse communities worldwide.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Designed for everyday people, not just legal professionals.',
    },
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'AI/ML Engineer',
      description: 'Specialized in NLP and document processing systems.',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Legal Tech Consultant',
      description: 'Expert in legal document analysis and compliance.',
    },
    {
      name: 'Maria Rodriguez',
      role: 'UX Designer',
      description: 'Focused on creating accessible and intuitive interfaces.',
    },
    {
      name: 'David Park',
      role: 'Cloud Architect',
      description: 'Ensures scalable and secure cloud infrastructure.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About <span className="gradient-text">LegalEase AI</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make legal documents accessible to everyone through the power of AI.
              No more confusion, no more expensive legal consultations for simple document understanding.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Legal documents shouldn't be a barrier to understanding your rights and obligations. 
                Every day, millions of people sign contracts, agreements, and legal documents without 
                fully understanding what they're agreeing to.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                LegalEase AI bridges this gap by using advanced AI to translate complex legal language 
                into plain, understandable terms. We believe that legal literacy is a fundamental right, 
                and technology can help democratize access to legal understanding.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Accessible</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Secure</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Reliable</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <Heart className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">Built with Purpose</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold mb-2">10K+</div>
                    <div className="text-blue-100">Documents Processed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">98%</div>
                    <div className="text-blue-100">User Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">2</div>
                    <div className="text-blue-100">Languages Supported</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-blue-100">Available</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge AI with a deep understanding of legal complexity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Google Cloud AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We leverage enterprise-grade AI services to ensure accuracy, reliability, and security
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-blue-100 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Document AI</h3>
                <p className="text-blue-700">
                  Advanced OCR and document structure understanding for accurate text extraction
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-purple-100 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-purple-900 mb-2">Vertex AI</h3>
                <p className="text-purple-700">
                  Large language models for summarization, risk analysis, and question answering
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-green-100 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-green-900 mb-2">Cloud Security</h3>
                <p className="text-green-700">
                  Enterprise-grade security and compliance for your sensitive documents
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A diverse group of engineers, designers, and legal experts working to democratize legal understanding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Understand Your Legal Documents?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust LegalEase AI to make sense of their legal documents.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/upload"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Free
              </a>
              
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Contact Us
              </a>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Trusted by 10,000+ users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>98% satisfaction rate</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  Shield, 
  CheckCircle,
  Clock,
  User,
  Bot,
  Copy,
  Download,
  Share2,
  RefreshCw,
  Loader
} from 'lucide-react';
import { useDocument } from '../context/DocumentContext';
import { useLanguage } from '../context/LanguageContext';

const Document = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const chatEndRef = useRef(null);
  
  const { 
    currentDocument, 
    loading, 
    error, 
    getDocument, 
    askQuestion, 
    getQAHistory 
  } = useDocument();
  const { t, formatDate } = useLanguage();

  useEffect(() => {
    if (id) {
      getDocument(id);
      getQAHistory(id);
    }
  }, [id, getDocument, getQAHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [currentDocument?.qaHistory]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    setIsAsking(true);
    try {
      await askQuestion(id, question.trim(), currentDocument?.language || 'en');
      setQuestion('');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to ask question:', error);
    } finally {
      setIsAsking(false);
    }
  };

  const getRiskLevelStyle = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical')) return 'risk-critical';
    if (lowerText.includes('high')) return 'risk-high';
    if (lowerText.includes('medium')) return 'risk-medium';
    return 'risk-low';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('loading', 'Loading document...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Upload New Document
          </button>
        </div>
      </div>
    );
  }

  if (!currentDocument) {
    return null;
  }

  const tabs = [
    { id: 'summary', label: t('documentSummary', 'Summary'), icon: FileText },
    { id: 'risks', label: t('riskAnalysis', 'Risk Analysis'), icon: Shield },
    { id: 'chat', label: 'Q&A Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {currentDocument.originalName}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(currentDocument.createdAt)}
                  </span>
                  <span>{Math.round(currentDocument.size / 1024)} KB</span>
                  <span className="capitalize">{currentDocument.language}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Copy className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-t-2xl shadow-lg">
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-b-2xl shadow-lg p-6 min-h-[500px]"
            >
              {/* Summary Tab */}
              {activeTab === 'summary' && currentDocument.summary && (
                <div className="prose prose-gray max-w-none">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 m-0">
                      Document Summary
                    </h3>
                    <button
                      onClick={() => copyToClipboard(currentDocument.summary.summary)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Copy summary"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {currentDocument.summary.summary}
                  </div>
                </div>
              )}

              {/* Risk Analysis Tab */}
              {activeTab === 'risks' && currentDocument.riskAnalysis && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      Risk Analysis
                    </h3>
                    <button
                      onClick={() => copyToClipboard(currentDocument.riskAnalysis.riskAnalysis)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Copy risk analysis"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {currentDocument.riskAnalysis.riskAnalysis}
                  </div>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Ask Questions About This Document
                    </h3>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {currentDocument.qaHistory && currentDocument.qaHistory.length > 0 ? (
                      currentDocument.qaHistory.map((qa, index) => (
                        <div key={qa.id || index} className="space-y-3">
                          {/* User Question */}
                          <div className="flex justify-end">
                            <div className="max-w-3xl">
                              <div className="flex items-center justify-end space-x-2 mb-1">
                                <span className="text-xs text-gray-500">
                                  {formatDate(qa.timestamp || qa.createdAt)}
                                </span>
                                <User className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="message-user p-4">
                                {qa.question}
                              </div>
                            </div>
                          </div>

                          {/* AI Answer */}
                          <div className="flex justify-start">
                            <div className="max-w-3xl">
                              <div className="flex items-center space-x-2 mb-1">
                                <Bot className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-gray-500">LegalEase AI</span>
                              </div>
                              <div className="message-ai p-4">
                                <div className="whitespace-pre-wrap">
                                  {qa.answer}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No questions asked yet.</p>
                          <p className="text-sm">Start by asking a question about this document.</p>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Question Input */}
                  <form onSubmit={handleAskQuestion} className="flex space-x-3">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t('questionPlaceholder', 'What would you like to know about this document?')}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isAsking}
                    />
                    <button
                      type="submit"
                      disabled={!question.trim() || isAsking}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        question.trim() && !isAsking
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isAsking ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Document Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Processing Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Text Extraction</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Summarization</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Analysis</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Document Stats */}
              {currentDocument.extractedData && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Document Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pages</span>
                      <span className="text-sm font-medium">
                        {currentDocument.extractedData.pages}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Entities Found</span>
                      <span className="text-sm font-medium">
                        {currentDocument.extractedData.entities}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="text-sm font-medium">
                        {Math.round(currentDocument.extractedData.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    <span>Regenerate Summary</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Analysis</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share Document</span>
                  </button>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Legal Disclaimer
                    </h4>
                    <p className="text-sm text-yellow-700">
                      {t('disclaimer', 'This is informational only and not legal advice. Consult a qualified attorney for legal guidance.')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;

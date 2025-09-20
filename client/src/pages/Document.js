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

  // Helper function to format summary content into structured sections
  const formatSummaryContent = (summaryText) => {
    if (!summaryText) return null;

    // Split the summary into sections based on numbered points or headers
    const sections = summaryText.split(/\d+\.\s*/).filter(section => section.trim());
    
    // If no numbered sections found, try to split by common headers
    if (sections.length <= 1) {
      const headerSections = summaryText.split(/(?=DOCUMENT TYPE|KEY PARTIES|MAIN PURPOSE|KEY TERMS|IMPORTANT DATES|FINANCIAL TERMS|RIGHTS & OBLIGATIONS|TERMINATION CONDITIONS|DISPUTE RESOLUTION)/i);
      if (headerSections.length > 1) {
        return headerSections.map((section, index) => formatSection(section.trim(), index));
      }
    }

    // If still no clear structure, display as formatted text blocks
    if (sections.length <= 1) {
      return (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed text-base">
              {renderMarkdownContent(summaryText)}
            </div>
          </div>
        </div>
      );
    }

    // Format numbered sections
    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      if (lines.length === 0) return null;

      const title = lines[0].replace(/^(DOCUMENT TYPE|KEY PARTIES|MAIN PURPOSE|KEY TERMS|IMPORTANT DATES|FINANCIAL TERMS|RIGHTS & OBLIGATIONS|TERMINATION CONDITIONS|DISPUTE RESOLUTION):?\s*/i, '');
      const content = lines.slice(1).join('\n').trim() || lines[0];
      
      return formatSection(`${getSectionTitle(index + 1)}: ${title}`, index, content);
    }).filter(Boolean);
  };

  // Helper function to get section titles
  const getSectionTitle = (index) => {
    const titles = [
      'Document Type', 'Key Parties', 'Main Purpose', 'Key Terms', 
      'Important Dates', 'Financial Terms', 'Rights & Obligations', 
      'Termination Conditions', 'Dispute Resolution'
    ];
    return titles[index - 1] || `Section ${index}`;
  };

  // Helper function to clean section titles
  const cleanSectionTitle = (title) => {
    return title
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^(DOCUMENT TYPE|KEY PARTIES|MAIN PURPOSE|KEY TERMS|IMPORTANT DATES|FINANCIAL TERMS|RIGHTS & OBLIGATIONS|TERMINATION CONDITIONS|DISPUTE RESOLUTION):\s*/i, '') // Remove section headers
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/###/g, '') // Remove markdown headers
      .trim();
  };

  // Helper function to format individual sections
  const formatSection = (header, index, content = '') => {
    const sectionIcons = {
      0: '📋', 1: '👥', 2: '🎯', 3: '📝', 4: '📅', 
      5: '💰', 6: '⚖️', 7: '🔚', 8: '🤝'
    };
    
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500', 
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-teal-500 to-cyan-500',
      'from-red-500 to-pink-500'
    ];

    const bgColors = [
      'from-blue-50 to-cyan-50',
      'from-purple-50 to-pink-50',
      'from-green-50 to-teal-50', 
      'from-orange-50 to-red-50',
      'from-indigo-50 to-purple-50',
      'from-yellow-50 to-orange-50',
      'from-pink-50 to-rose-50',
      'from-teal-50 to-cyan-50',
      'from-red-50 to-pink-50'
    ];

    const colorIndex = index % colors.length;

    return (
      <div key={index} className={`summary-section bg-gradient-to-r ${bgColors[colorIndex]} rounded-xl p-6 border border-gray-200`}>
        <div className="flex items-start space-x-4">
          <div className={`summary-icon flex-shrink-0 w-12 h-12 bg-gradient-to-r ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
            {sectionIcons[colorIndex] || '📄'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              {cleanSectionTitle(header)}
            </h4>
            <div className="summary-prose">
              <div className="text-gray-700 text-base leading-relaxed">
                {renderMarkdownContent(content || header.split(':').slice(1).join(':').trim())}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to count words in summary
  const getSummaryWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  };

  // Helper function to estimate reading time
  const getEstimatedReadingTime = (text) => {
    if (!text) return 0;
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = getSummaryWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Handle regenerating summary
  const handleRegenerateSummary = async () => {
    try {
      // This would call an API to regenerate the summary
      console.log('Regenerating summary for document:', id);
      // For now, just show a placeholder
      alert('Summary regeneration feature will be implemented soon!');
    } catch (error) {
      console.error('Failed to regenerate summary:', error);
    }
  };

  // Handle regenerating risk analysis
  const handleRegenerateRiskAnalysis = async () => {
    try {
      // This would call an API to regenerate the risk analysis
      console.log('Regenerating risk analysis for document:', id);
      // For now, just show a placeholder
      alert('Risk analysis regeneration feature will be implemented soon!');
    } catch (error) {
      console.error('Failed to regenerate risk analysis:', error);
    }
  };

  // Helper function to render markdown content as JSX
  const renderMarkdownContent = (text) => {
    if (!text) return null;

    // Split text into lines for processing
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let listType = null;

    const processLine = (line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and ### markers
      if (!trimmedLine || trimmedLine === '###') {
        if (currentList.length > 0) {
          // Close current list
          elements.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-1 ml-4 mb-3">
              {currentList.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {processInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
          currentList = [];
          listType = null;
        }
        return;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('* ')) {
        const content = trimmedLine.substring(2).trim();
        currentList.push(content);
        return;
      }

      // If we have a pending list, close it
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 ml-4 mb-3">
            {currentList.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {processInlineFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
        listType = null;
      }

      // Handle regular paragraphs
      if (trimmedLine) {
        elements.push(
          <p key={index} className="mb-3 leading-relaxed">
            {processInlineFormatting(trimmedLine)}
          </p>
        );
      }
    };

    lines.forEach(processLine);

    // Close any remaining list
    if (currentList.length > 0) {
      elements.push(
        <ul key="final-list" className="list-disc list-inside space-y-1 ml-4 mb-3">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {processInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
    }

    return <div>{elements}</div>;
  };

  // Helper function to process inline formatting (bold, etc.)
  const processInlineFormatting = (text) => {
    if (!text) return text;

    // Split by bold markers and process
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const content = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {content}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper function to format risk analysis content into structured sections
  const formatRiskAnalysisContent = (riskText) => {
    if (!riskText) return null;

    // Split the risk analysis into sections based on numbered points or headers
    const sections = riskText.split(/\d+\.\s*/).filter(section => section.trim());
    
    // If no numbered sections found, try to split by common risk headers
    if (sections.length <= 1) {
      const headerSections = riskText.split(/(?=HIGH-RISK CLAUSES|FINANCIAL RISKS|UNFAIR TERMS|UNCLEAR LANGUAGE|MISSING PROTECTIONS|TERMINATION RISKS|LIABILITY CONCERNS|COMPLIANCE ISSUES)/i);
      if (headerSections.length > 1) {
        return headerSections.map((section, index) => formatRiskSection(section.trim(), index));
      }
    }

    // If still no clear structure, display as formatted text blocks
    if (sections.length <= 1) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed text-base">
              {renderMarkdownContent(riskText)}
            </div>
          </div>
        </div>
      );
    }

    // Format numbered sections
    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      if (lines.length === 0) return null;

      const title = lines[0].replace(/^(HIGH-RISK CLAUSES|FINANCIAL RISKS|UNFAIR TERMS|UNCLEAR LANGUAGE|MISSING PROTECTIONS|TERMINATION RISKS|LIABILITY CONCERNS|COMPLIANCE ISSUES):?\s*/i, '');
      const content = lines.slice(1).join('\n').trim() || lines[0];
      
      return formatRiskSection(`${getRiskSectionTitle(index + 1)}: ${title}`, index, content);
    }).filter(Boolean);
  };

  // Helper function to get risk section titles
  const getRiskSectionTitle = (index) => {
    const titles = [
      'High-Risk Clauses', 'Financial Risks', 'Unfair Terms', 'Unclear Language', 
      'Missing Protections', 'Termination Risks', 'Liability Concerns', 'Compliance Issues'
    ];
    return titles[index - 1] || `Risk Category ${index}`;
  };

  // Helper function to format individual risk sections
  const formatRiskSection = (header, index, content = '') => {
    const riskIcons = {
      0: '⚠️', 1: '💰', 2: '⚖️', 3: '❓', 4: '🛡️', 
      5: '🔚', 6: '📋', 7: '📜'
    };
    
    const riskColors = [
      'from-red-500 to-rose-500',
      'from-orange-500 to-amber-500', 
      'from-yellow-500 to-orange-500',
      'from-purple-500 to-violet-500',
      'from-blue-500 to-indigo-500',
      'from-green-500 to-emerald-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-500'
    ];

    const riskBgColors = [
      'from-red-50 to-rose-50',
      'from-orange-50 to-amber-50',
      'from-yellow-50 to-orange-50', 
      'from-purple-50 to-violet-50',
      'from-blue-50 to-indigo-50',
      'from-green-50 to-emerald-50',
      'from-pink-50 to-rose-50',
      'from-indigo-50 to-purple-50'
    ];

    const colorIndex = index % riskColors.length;

    return (
      <div key={index} className={`summary-section bg-gradient-to-r ${riskBgColors[colorIndex]} rounded-xl p-6 border-l-4 border-${riskColors[colorIndex].split('-')[1]}-400`}>
        <div className="flex items-start space-x-4">
          <div className={`summary-icon flex-shrink-0 w-12 h-12 bg-gradient-to-r ${riskColors[colorIndex]} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
            {riskIcons[colorIndex] || '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              {cleanSectionTitle(header)}
            </h4>
            <div className="summary-prose">
              <div className="text-gray-700 text-base leading-relaxed">
                {renderRiskContent(content || header.split(':').slice(1).join(':').trim())}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render risk content with risk level badges
  const renderRiskContent = (text) => {
    if (!text) return null;

    // Split text into lines for processing
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];

    const processRiskLine = (line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and ### markers
      if (!trimmedLine || trimmedLine === '###') {
        if (currentList.length > 0) {
          // Close current list
          elements.push(
            <ul key={`risk-list-${index}`} className="list-disc list-inside space-y-2 ml-4 mb-4">
              {currentList.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {processRiskFormatting(item)}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
        return;
      }

      // Handle bullet points
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        const content = trimmedLine.substring(2).trim();
        currentList.push(content);
        return;
      }

      // If we have a pending list, close it
      if (currentList.length > 0) {
        elements.push(
          <ul key={`risk-list-${index}`} className="list-disc list-inside space-y-2 ml-4 mb-4">
            {currentList.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {processRiskFormatting(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }

      // Handle regular paragraphs
      if (trimmedLine) {
        elements.push(
          <p key={index} className="mb-3 leading-relaxed">
            {processRiskFormatting(trimmedLine)}
          </p>
        );
      }
    };

    lines.forEach(processRiskLine);

    // Close any remaining list
    if (currentList.length > 0) {
      elements.push(
        <ul key="final-risk-list" className="list-disc list-inside space-y-2 ml-4 mb-4">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {processRiskFormatting(item)}
            </li>
          ))}
        </ul>
      );
    }

    return <div>{elements}</div>;
  };

  // Helper function to process risk formatting with risk level badges
  const processRiskFormatting = (text) => {
    if (!text) return text;

    // First process inline formatting (bold, etc.)
    let processedText = processInlineFormatting(text);

    // Then add risk level badges
    const riskLevelRegex = /(Risk Level:\s*)(HIGH|MEDIUM|LOW)/gi;
    
    if (typeof processedText === 'string') {
      const parts = processedText.split(riskLevelRegex);
      return parts.map((part, index) => {
        if (part.match(/^(HIGH|MEDIUM|LOW)$/i)) {
          const level = part.toUpperCase();
          const badgeClass = level === 'HIGH' ? 'bg-red-100 text-red-800 border-red-200' :
                            level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200';
          
          return (
            <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-1 ${badgeClass}`}>
              {level} RISK
            </span>
          );
        }
        return part;
      });
    }

    return processedText;
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
                    {formatDate(currentDocument.createdAt || new Date())}
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
                <div className="max-w-none">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Document Summary
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          AI-generated analysis • {currentDocument.summary.language === 'hi' ? 'हिंदी' : 'English'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(currentDocument.summary.summary)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-gray-200 hover:border-blue-200"
                        title="Copy summary"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">Copy</span>
                      </button>
                      <button
                        onClick={() => handleRegenerateSummary()}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all border border-gray-200 hover:border-green-200"
                        title="Regenerate summary"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-sm font-medium">Regenerate</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {formatSummaryContent(currentDocument.summary.summary)}
                  </div>

                  {/* Summary Metadata */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Generated by {currentDocument.summary.model}</span>
                        <span>•</span>
                        <span>{formatDate(currentDocument.summary.generatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{getSummaryWordCount(currentDocument.summary.summary)} words</span>
                        <span>•</span>
                        <span>{getEstimatedReadingTime(currentDocument.summary.summary)} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Analysis Tab */}
              {activeTab === 'risks' && currentDocument.riskAnalysis && (
                <div className="max-w-none">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Risk Analysis
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          AI-powered risk assessment • {currentDocument.riskAnalysis.language === 'hi' ? 'हिंदी' : 'English'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(currentDocument.riskAnalysis.risks || currentDocument.riskAnalysis.riskAnalysis)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-gray-200 hover:border-blue-200"
                        title="Copy risk analysis"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">Copy</span>
                      </button>
                      <button
                        onClick={() => handleRegenerateRiskAnalysis()}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all border border-gray-200 hover:border-green-200"
                        title="Regenerate risk analysis"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-sm font-medium">Regenerate</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {formatRiskAnalysisContent(currentDocument.riskAnalysis.risks || currentDocument.riskAnalysis.riskAnalysis)}
                  </div>

                  {/* Risk Analysis Metadata */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Generated by {currentDocument.riskAnalysis.model}</span>
                        <span>•</span>
                        <span>{formatDate(currentDocument.riskAnalysis.generatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{getSummaryWordCount(currentDocument.riskAnalysis.risks || currentDocument.riskAnalysis.riskAnalysis)} words</span>
                        <span>•</span>
                        <span>{getEstimatedReadingTime(currentDocument.riskAnalysis.risks || currentDocument.riskAnalysis.riskAnalysis)} min read</span>
                      </div>
                    </div>
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
                      currentDocument.qaHistory.map((qa, index) => {
                        // Ensure qa object exists and has required properties
                        if (!qa || typeof qa !== 'object') {
                          return null;
                        }
                        
                        return (
                        <div key={qa.id || index} className="space-y-3">
                          {/* User Question */}
                          <div className="flex justify-end">
                            <div className="max-w-3xl">
                              <div className="flex items-center justify-end space-x-2 mb-1">
                                <span className="text-xs text-gray-500">
                                  {formatDate(qa.timestamp || qa.createdAt || new Date())}
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
                        );
                      }).filter(Boolean)
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

import React, { createContext, useContext, useState, useCallback } from 'react';

// Language data
const languages = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    translations: {
      // Navigation
      home: 'Home',
      upload: 'Upload Document',
      about: 'About',
      privacy: 'Privacy',
      
      // Common
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      
      // Home page
      heroTitle: 'Simplify Legal Documents with AI',
      heroSubtitle: 'Upload contracts, agreements, and legal documents to get plain-language summaries, risk analysis, and instant answers to your questions.',
      getStarted: 'Get Started',
      howItWorks: 'How It Works',
      features: 'Features',
      
      // Upload page
      uploadTitle: 'Upload Your Document',
      uploadSubtitle: 'Drag and drop your legal document or click to browse',
      supportedFormats: 'Supported formats: PDF, JPEG, PNG, TXT',
      maxFileSize: 'Maximum file size: 10MB',
      selectLanguage: 'Select Output Language',
      uploadButton: 'Upload & Process',
      
      // Document page
      documentSummary: 'Document Summary',
      riskAnalysis: 'Risk Analysis',
      askQuestion: 'Ask a Question',
      questionPlaceholder: 'What would you like to know about this document?',
      send: 'Send',
      qaHistory: 'Q&A History',
      explainClause: 'Explain This Clause',
      
      // Risk levels
      riskLow: 'Low Risk',
      riskMedium: 'Medium Risk',
      riskHigh: 'High Risk',
      riskCritical: 'Critical Risk',
      
      // Footer
      disclaimer: 'This is informational only and not legal advice. Consult a qualified attorney for legal guidance.',
      madeWith: 'Made with',
      poweredBy: 'Powered by Google Cloud AI',
    },
  },
  hi: {
    code: 'hi',
    name: 'हिंदी',
    flag: '🇮🇳',
    translations: {
      // Navigation
      home: 'होम',
      upload: 'दस्तावेज़ अपलोड करें',
      about: 'के बारे में',
      privacy: 'गोपनीयता',
      
      // Common
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      delete: 'मिटाएं',
      edit: 'संपादित करें',
      save: 'सेव करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      
      // Home page
      heroTitle: 'AI के साथ कानूनी दस्तावेज़ों को सरल बनाएं',
      heroSubtitle: 'अनुबंध, समझौते और कानूनी दस्तावेज़ अपलोड करें और सरल भाषा में सारांश, जोखिम विश्लेषण और तत्काल उत्तर प्राप्त करें।',
      getStarted: 'शुरू करें',
      howItWorks: 'यह कैसे काम करता है',
      features: 'विशेषताएं',
      
      // Upload page
      uploadTitle: 'अपना दस्तावेज़ अपलोड करें',
      uploadSubtitle: 'अपने कानूनी दस्तावेज़ को खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें',
      supportedFormats: 'समर्थित प्रारूप: PDF, JPEG, PNG, TXT',
      maxFileSize: 'अधिकतम फ़ाइल आकार: 10MB',
      selectLanguage: 'आउटपुट भाषा चुनें',
      uploadButton: 'अपलोड और प्रक्रिया',
      
      // Document page
      documentSummary: 'दस्तावेज़ सारांश',
      riskAnalysis: 'जोखिम विश्लेषण',
      askQuestion: 'प्रश्न पूछें',
      questionPlaceholder: 'इस दस्तावेज़ के बारे में आप क्या जानना चाहते हैं?',
      send: 'भेजें',
      qaHistory: 'प्रश्न-उत्तर इतिहास',
      explainClause: 'इस खंड को समझाएं',
      
      // Risk levels
      riskLow: 'कम जोखिम',
      riskMedium: 'मध्यम जोखिम',
      riskHigh: 'उच्च जोखिम',
      riskCritical: 'गंभीर जोखिम',
      
      // Footer
      disclaimer: 'यह केवल जानकारी के लिए है और कानूनी सलाह नहीं है। कानूनी मार्गदर्शन के लिए एक योग्य वकील से सलाह लें।',
      madeWith: 'के साथ बनाया गया',
      poweredBy: 'Google Cloud AI द्वारा संचालित',
    },
  },
};

// Initial state
const initialState = {
  currentLanguage: 'en',
  availableLanguages: Object.keys(languages),
};

// Context
const LanguageContext = createContext();

// Provider component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get from localStorage or default to English
    return localStorage.getItem('legalease-language') || 'en';
  });

  // Change language
  const changeLanguage = useCallback((languageCode) => {
    if (languages[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('legalease-language', languageCode);
    }
  }, []);

  // Get translation
  const t = useCallback((key, defaultValue = key) => {
    const translation = languages[currentLanguage]?.translations?.[key];
    return translation || defaultValue;
  }, [currentLanguage]);

  // Get current language info
  const getCurrentLanguage = useCallback(() => {
    return languages[currentLanguage];
  }, [currentLanguage]);

  // Get all available languages
  const getAvailableLanguages = useCallback(() => {
    return Object.values(languages);
  }, []);

  // Check if language is RTL (for future use)
  const isRTL = useCallback(() => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(currentLanguage);
  }, [currentLanguage]);

  // Format date according to language
  const formatDate = useCallback((date, options = {}) => {
    const locale = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(new Date(date));
  }, [currentLanguage]);

  // Format number according to language
  const formatNumber = useCallback((number, options = {}) => {
    const locale = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }, [currentLanguage]);

  // Get file size format
  const formatFileSize = useCallback((bytes) => {
    const units = currentLanguage === 'hi' 
      ? ['बाइट्स', 'KB', 'MB', 'GB']
      : ['bytes', 'KB', 'MB', 'GB'];
    
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }, [currentLanguage]);

  // Context value
  const value = {
    currentLanguage,
    availableLanguages: Object.keys(languages),
    changeLanguage,
    t,
    getCurrentLanguage,
    getAvailableLanguages,
    isRTL,
    formatDate,
    formatNumber,
    formatFileSize,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;

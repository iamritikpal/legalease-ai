import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Cloud } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">LegalEase AI</h3>
                <p className="text-sm text-gray-400">Legal Document Simplifier</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Making legal documents accessible to everyone through the power of AI. 
              Get plain-language summaries, risk analysis, and instant answers to your legal questions.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Cloud className="w-4 h-4" />
              <span>{t('poweredBy')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/upload" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {t('upload')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Document Summarization</li>
              <li>Risk Analysis</li>
              <li>Q&A Assistant</li>
              <li>Clause Explanation</li>
              <li>Bilingual Support</li>
              <li>Secure Processing</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>© 2024 LegalEase AI.</span>
              <span>{t('madeWith')}</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for better legal accessibility.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-yellow-400 mb-1">Legal Disclaimer</h5>
                <p className="text-sm text-gray-300">
                  {t('disclaimer')} This service uses AI technology which may not be 100% accurate. 
                  Always verify important information with qualified legal professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

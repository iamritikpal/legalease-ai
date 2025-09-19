import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  documents: [],
  currentDocument: null,
  loading: false,
  uploading: false,
  processing: false,
  error: null,
  uploadProgress: 0,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_UPLOADING: 'SET_UPLOADING',
  SET_PROCESSING: 'SET_PROCESSING',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  SET_CURRENT_DOCUMENT: 'SET_CURRENT_DOCUMENT',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  REMOVE_DOCUMENT: 'REMOVE_DOCUMENT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_QA: 'ADD_QA',
  SET_QA_HISTORY: 'SET_QA_HISTORY',
};

// Reducer
const documentReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload, error: null };
    
    case ActionTypes.SET_UPLOADING:
      return { ...state, uploading: action.payload, error: null };
    
    case ActionTypes.SET_PROCESSING:
      return { ...state, processing: action.payload, error: null };
    
    case ActionTypes.SET_UPLOAD_PROGRESS:
      return { ...state, uploadProgress: action.payload };
    
    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload, loading: false, error: null };
    
    case ActionTypes.SET_CURRENT_DOCUMENT:
      return { ...state, currentDocument: action.payload, loading: false, error: null };
    
    case ActionTypes.ADD_DOCUMENT:
      return {
        ...state,
        documents: [action.payload, ...state.documents],
        uploading: false,
        processing: false,
        uploadProgress: 0,
        error: null,
      };
    
    case ActionTypes.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
        ),
        currentDocument: state.currentDocument?.id === action.payload.id
          ? { ...state.currentDocument, ...action.payload }
          : state.currentDocument,
        error: null,
      };
    
    case ActionTypes.REMOVE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        currentDocument: state.currentDocument?.id === action.payload ? null : state.currentDocument,
        error: null,
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        uploading: false,
        processing: false,
        uploadProgress: 0,
      };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.ADD_QA:
      return {
        ...state,
        currentDocument: state.currentDocument ? {
          ...state.currentDocument,
          qaHistory: [action.payload, ...(state.currentDocument.qaHistory || [])],
        } : null,
      };
    
    case ActionTypes.SET_QA_HISTORY:
      return {
        ...state,
        currentDocument: state.currentDocument ? {
          ...state.currentDocument,
          qaHistory: action.payload,
        } : null,
      };
    
    default:
      return state;
  }
};

// Context
const DocumentContext = createContext();

// Provider component
export const DocumentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || '/api';

  // Upload document
  const uploadDocument = useCallback(async (file, language = 'en') => {
    try {
      dispatch({ type: ActionTypes.SET_UPLOADING, payload: true });
      dispatch({ type: ActionTypes.SET_UPLOAD_PROGRESS, payload: 0 });

      const formData = new FormData();
      formData.append('document', file);
      formData.append('language', language);

      const response = await axios.post(`${API_BASE}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch({ type: ActionTypes.SET_UPLOAD_PROGRESS, payload: progress });
        },
      });

      if (response.data.success) {
        const documentData = {
          id: response.data.documentId,
          ...response.data.data.fileInfo,
          extractedData: response.data.data.extractedData,
          summary: response.data.data.summary,
          riskAnalysis: response.data.data.riskAnalysis,
          language,
          status: 'completed',
          createdAt: new Date().toISOString(),
        };

        dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: documentData });
        toast.success('Document uploaded and processed successfully!');
        return documentData;
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE]);

  // Get document by ID
  const getDocument = useCallback(async (documentId) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const response = await axios.get(`${API_BASE}/documents/${documentId}`);

      if (response.data.success) {
        dispatch({ type: ActionTypes.SET_CURRENT_DOCUMENT, payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get document');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get document';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE]);

  // Get recent documents
  const getRecentDocuments = useCallback(async (limit = 10) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      const response = await axios.get(`${API_BASE}/documents?limit=${limit}`);

      if (response.data.success) {
        dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get documents');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get documents';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      return [];
    }
  }, [API_BASE]);

  // Delete document
  const deleteDocument = useCallback(async (documentId) => {
    try {
      const response = await axios.delete(`${API_BASE}/documents/${documentId}`);

      if (response.data.success) {
        dispatch({ type: ActionTypes.REMOVE_DOCUMENT, payload: documentId });
        toast.success('Document deleted successfully');
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete document');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete document';
      toast.error(errorMessage);
      return false;
    }
  }, [API_BASE]);

  // Ask question about document
  const askQuestion = useCallback(async (documentId, question, language = 'en') => {
    try {
      const response = await axios.post(`${API_BASE}/ai/question/${documentId}`, {
        question,
        language,
      });

      if (response.data.success) {
        const qaData = response.data.data;
        dispatch({ type: ActionTypes.ADD_QA, payload: qaData });
        return qaData;
      } else {
        throw new Error(response.data.error || 'Failed to get answer');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get answer';
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE]);

  // Get Q&A history
  const getQAHistory = useCallback(async (documentId) => {
    try {
      const response = await axios.get(`${API_BASE}/ai/questions/${documentId}`);

      if (response.data.success) {
        dispatch({ type: ActionTypes.SET_QA_HISTORY, payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to get Q&A history');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get Q&A history';
      return [];
    }
  }, [API_BASE]);

  // Explain clause
  const explainClause = useCallback(async (clause, language = 'en') => {
    try {
      const response = await axios.post(`${API_BASE}/ai/explain-clause`, {
        clause,
        language,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to explain clause');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to explain clause';
      toast.error(errorMessage);
      throw error;
    }
  }, [API_BASE]);

  // Regenerate summary
  const regenerateSummary = useCallback(async (documentId, language = 'en') => {
    try {
      dispatch({ type: ActionTypes.SET_PROCESSING, payload: true });

      const response = await axios.post(`${API_BASE}/ai/regenerate-summary/${documentId}`, {
        language,
      });

      if (response.data.success) {
        const updatedData = { summary: response.data.data, language };
        dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: { id: documentId, ...updatedData } });
        toast.success('Summary regenerated successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to regenerate summary');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to regenerate summary';
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_PROCESSING, payload: false });
    }
  }, [API_BASE]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    uploadDocument,
    getDocument,
    getRecentDocuments,
    deleteDocument,
    askQuestion,
    getQAHistory,
    explainClause,
    regenerateSummary,
    clearError,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook to use the context
export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

export default DocumentContext;

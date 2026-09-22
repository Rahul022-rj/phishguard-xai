import axios from 'axios';

// Falls back to your live Render backend API if VITE_API_BASE_URL is not defined
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://phishguard-xai-gg7l.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;

/**
 * Sends offer letter text, uploaded document file, or URL payload to the XAI scan endpoint.
 *
 * @param {FormData|Object} payload - FormData containing file/text/url or raw JSON object
 * @param {Function} [onProgress] - Optional upload progress callback function
 * @returns {Promise<Object>} Scan results containing threat score, red flags, and XAI radar metrics
 */
export const analyzeOfferLetter = async (payload, onProgress) => {
  const isFormData = payload instanceof FormData;
  const response = await api.post('/scan', payload, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

/**
 * Sends a chat prompt to the Gemini assistant grounded in the current scan context.
 *
 * @param {string} scanId - ID of the active document scan
 * @param {string} question - User chat prompt
 * @param {Array} chatHistory - Array of previous multi-turn chat messages
 * @returns {Promise<Object>} Response object containing the assistant message
 */
export const sendChatMessage = async (scanId, question, chatHistory) => {
  const response = await api.post('/chat', {
    scan_id: scanId,
    question,
    chat_history: chatHistory,
  });
  return response.data;
};

/**
 * Retrieves historical scan results from the database.
 *
 * @returns {Promise<Array>} List of past scan reports
 */
export const getScanHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};
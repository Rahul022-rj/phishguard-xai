import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

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

export const sendChatMessage = async (scanId, question, chatHistory) => {
  const response = await api.post('/chat', {
    scan_id: scanId,
    question,
    chat_history: chatHistory,
  });
  return response.data;
};

export const getScanHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export default api;
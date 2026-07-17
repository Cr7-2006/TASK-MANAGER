import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set auth token helper
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Fetch all tasks with optional filters
export const getTasks = async (filters = {}) => {
  const { status, priority, search, sortBy } = filters;
  let query = '';
  const params = [];

  if (status) params.push(`status=${status}`);
  if (priority) params.push(`priority=${priority}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (sortBy) params.push(`sortBy=${sortBy}`);

  if (params.length > 0) {
    query = `?${params.join('&')}`;
  }

  const response = await axios.get(`${API_URL}/tasks${query}`);
  return response.data;
};

// Fetch single task
export const getTaskById = async (id) => {
  const response = await axios.get(`${API_URL}/tasks/${id}`);
  return response.data;
};

// Create new task
export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/tasks`, taskData);
  return response.data;
};

// Update task
export const updateTask = async (id, taskData) => {
  const response = await axios.put(`${API_URL}/tasks/${id}`, taskData);
  return response.data;
};

// Delete task
export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_URL}/tasks/${id}`);
  return response.data;
};

// Add comment
export const addComment = async (taskId, text) => {
  const response = await axios.post(`${API_URL}/tasks/${taskId}/comments`, { text });
  return response.data;
};

// Delete comment
export const deleteComment = async (taskId, commentId) => {
  const response = await axios.delete(`${API_URL}/tasks/${taskId}/comments/${commentId}`);
  return response.data;
};

// Get AI Suggestions
export const getAISuggestions = async (title) => {
  const response = await axios.post(`${API_URL}/tasks/ai-suggest`, { title });
  return response.data;
};

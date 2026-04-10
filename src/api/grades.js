import api from './axiosInstance';
export const getGrades = (params) => api.get('/grades', { params });
export const createGrade = (data) => api.post('/grades', data);
export const updateGrade = (id, data) => api.put(`/grades/${id}`, data);
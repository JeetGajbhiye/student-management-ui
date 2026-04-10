import api from './axiosInstance';
export const getEnrollments = (params) => api.get('/enrollments', { params });
export const createEnrollment = (data) => api.post('/enrollments', data);
export const updateEnrollment = (id, data) => api.put(`/enrollments/${id}`, data);
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`);
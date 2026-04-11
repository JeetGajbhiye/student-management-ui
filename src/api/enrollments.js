import api from './axiosInstance'
export const getEnrollments   = (p) => api.get('/enrollments', { params: p })
export const createEnrollment = (d) => api.post('/enrollments', d)
export const updateEnrollment = (id, d) => api.put(`/enrollments/${id}`, d)
export const deleteEnrollment = (id) => api.delete(`/enrollments/${id}`)
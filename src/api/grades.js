import api from './axiosInstance'
export const getGrades   = (p) => api.get('/grades', { params: p })
export const createGrade = (d) => api.post('/grades', d)
export const updateGrade = (id, d) => api.put(`/grades/${id}`, d);
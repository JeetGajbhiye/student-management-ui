import api from './axiosInstance'
export const getDepartments   = (p) => api.get('/api/departments', { params: p })
export const getDepartment    = (id) => api.get(`/departments/${id}`)
export const createDepartment = (d) => api.post('/departments', d)
export const updateDepartment = (id, d) => api.put(`/departments/${id}`, d)
export const deleteDepartment = (id) => api.delete(`/departments/${id}`)
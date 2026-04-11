import api from './axiosInstance'
export const getCourses   = (p) => api.get('/courses', { params: p })
export const getCourse    = (id) => api.get(`/courses/${id}`)
export const createCourse = (d) => api.post('/courses', d)
export const updateCourse = (id, d) => api.put(`/courses/${id}`, d)
export const deleteCourse = (id) => api.delete(`/courses/${id}`)
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sms_token') || null
  })

  const loginUser = (userData, accessToken) => {
    const cleanToken = accessToken?.trim()
    setUser(userData)
    setToken(cleanToken)
    localStorage.setItem('sms_user', JSON.stringify(userData))
    localStorage.setItem('sms_token', cleanToken)
  }

  const logoutUser = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sms_user')
    localStorage.removeItem('sms_token')
  }

  const isAuthenticated = !!token
  const isAdmin = user?.roles?.includes('ROLE_ADMIN')
  const isTeacher = user?.roles?.includes('ROLE_TEACHER')

  return (
    <AuthContext.Provider value={{
      user, token, loginUser, logoutUser,
      isAuthenticated, isAdmin, isTeacher
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
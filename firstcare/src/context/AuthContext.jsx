import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fc_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (userData) => {
    const u = { id: 1, name: userData.name || 'Demo User', email: userData.email, token: 'mock-jwt-token' }
    localStorage.setItem('fc_user', JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('fc_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

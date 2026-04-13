import { createContext, useContext, useState } from 'react'

const TriageContext = createContext(null)

export function TriageProvider({ children }) {
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState(null)

  return (
    <TriageContext.Provider value={{ result, setResult, formData, setFormData }}>
      {children}
    </TriageContext.Provider>
  )
}

export const useTriage = () => useContext(TriageContext)

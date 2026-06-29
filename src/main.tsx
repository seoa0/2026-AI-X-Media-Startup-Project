import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initAuthListener } from './shared/firebase/authService'
import { applyFontSize } from './shared/utils/fontSizeStorage'
import './shared/styles/global.css'
import App from './App.tsx'

initAuthListener()
applyFontSize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

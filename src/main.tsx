import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { enableMapSet } from 'immer'
import './i18n/config'  // Initialize i18n BEFORE app renders
import './index.css'
import App from './App.tsx'
import Konva from 'konva';
Konva.pixelRatio = 1;

enableMapSet()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

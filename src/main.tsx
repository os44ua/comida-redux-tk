/*import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)*/


// main.tsx
// Punto de entrada principal de la aplicación con Redux Provider
// Главная точка входа приложения с Redux Provider

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store/index.ts'
import logger from './services/logging'

// Inicializamos el logger
// Инициализируем logger
logger.info('🚀 Iniciando aplicación Comida Rápida con Redux Toolkit');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './pages/Landing/Landing.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
)

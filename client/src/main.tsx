
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import axios from 'axios';
axios.defaults.withCredentials = true;
import AppRoutes from "./routes/AppRoutes";
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AppRoutes />
  </BrowserRouter>
)
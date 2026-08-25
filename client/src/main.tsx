
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter , Routes , Route } from "react-router-dom";
import RunsList from "./RunList.tsx"
import RunsDetailList from './RunDetailList.tsx';
import axios from 'axios';
axios.defaults.withCredentials = true;
import AuthGate from './AuthGate.tsx';
import Workflow from './Workflow.tsx';
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AuthGate>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/workflow/:workflowId/runs" element={<RunsList />} />
      <Route path="/runs/:workflowRunId" element={<RunsDetailList />} />
      <Route path="/workflow/:workflowId" element={<Workflow />} />
    </Routes>
    </AuthGate>
  </BrowserRouter>
)
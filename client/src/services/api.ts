import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000", withCredentials: true });

export const fetchWorkflows = () => api.get("/workflows");
export const deleteWorkflow = (id: string) => api.delete(`/workflow/${id}`);
export const fetchWorkflow = (id: string) => api.get(`/workflow/${id}`);
export const fetchRepositories = () => api.get("/user/repos");
export const createWorkflow = (data: unknown) => api.post("/workflow/create", data);
export const updateWorkflow = (id: string, data: unknown) => api.put(`/workflow/${id}`, data);
export const fetchWorkflowRuns = (id: string) => api.get(`/workflow/${id}/runs`);
export const fetchWorkflowRun = (id: string) => api.get(`/runs/${id}`);

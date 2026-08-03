import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export default api;

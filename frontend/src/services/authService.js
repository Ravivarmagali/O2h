import axios from "axios";
const BASE = "http://localhost:5000/auth";
export const registerUser = (d) => axios.post(`${BASE}/register`, d);
export const loginUser    = (d) => axios.post(`${BASE}/login`, d);

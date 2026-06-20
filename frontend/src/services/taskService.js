import axios from "axios";
const BASE = "http://localhost:5000/tasks";

export const getTasks   = (params) => axios.get(BASE, { params });
export const getStats   = ()       => axios.get(`${BASE}/stats`);
export const createTask = (d)      => axios.post(BASE, d);
export const updateTask = (id, d)  => axios.put(`${BASE}/${id}`, d);
export const deleteTask = (id)     => axios.delete(`${BASE}/${id}`);

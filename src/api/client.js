import axios from 'axios';
const client=axios.create({baseURL:import.meta.env.VITE_API_URL||'https://res-api.13.232.129.80.nip.io/api'});
client.interceptors.request.use(config=>{const token=localStorage.getItem('token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
client.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){localStorage.removeItem('token');localStorage.removeItem('user');if(location.pathname!=='/login')location.href='/login';}return Promise.reject(e)});
export default client;

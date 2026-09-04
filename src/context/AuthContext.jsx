import {createContext,useContext,useEffect,useState} from 'react';import client from '../api/client';
const AuthContext=createContext(null);export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('user'))}catch{return null}});const [loading,setLoading]=useState(true);
useEffect(()=>{const token=localStorage.getItem('token');if(!token){setLoading(false);return}client.get('/auth/me').then(r=>setUser(r.data.user)).catch(()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null)}).finally(()=>setLoading(false))},[]);
const login=async(email,password)=>{const r=await client.post('/auth/login',{email,password});localStorage.setItem('token',r.data.token);localStorage.setItem('user',JSON.stringify(r.data.user));setUser(r.data.user);return r.data.user};
const logout=()=>{localStorage.clear();setUser(null);location.href='/login'};return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);

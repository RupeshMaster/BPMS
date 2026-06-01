import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useToast } from '../components/Toast';
import { useDispatch } from 'react-redux';
import { loginSession } from '../store/sessionSlice';
import api from '../utils/api';

// Define schema validation with Zod
const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required').trim(),
  password: z.string().min(1, 'Password is required'),
  nozzle: z.string().optional()
});

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const [errorMsg, setErrorMsg] = useState('');
  const [lang, setLang] = useState('English');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: '',
      password: '',
      nozzle: ''
    }
  });

  const handleLanguageToggle = () => {
    const nextLang = lang === 'English' ? 'हिन्दी (Hindi)' : 'English';
    setLang(nextLang);
    showToast(`Language switched to ${nextLang}`);
  };

  const loginAsUser = async (id, pass, noz) => {
    setErrorMsg('');
    const trimmedId = id.trim();
    try {
      const response = await api.post('/auth/login', { id: trimmedId, password: pass });
      const { token, user } = response.data;
      
      const sessionData = {
        ...user,
        nozzle: noz || user.nozzle || 'A' // Default to Nozzle A if worker
      };

      dispatch(loginSession({ user: sessionData, token }));
      showToast(`Welcome back, ${user.name}!`);
      
      // Redirect to correct dashboard based on actual role
      if (user.role === 'super-admin') {
        navigate('/super-admin');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/worker');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid ID or password. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

  const onSubmit = (data) => {
    loginAsUser(data.userId, data.password, data.nozzle);
  };

  return (
    <div className="auth-layout" style={{ display: 'flex', width: '100vw', height: '100dvh', position: 'absolute', top: 0, left: 0, zIndex: 100, backgroundColor: '#fff' }}>
      <motion.div 
        className="auth-left" 
        style={{ width: '48.5%', height: '100%' }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      ></motion.div>
      <motion.div 
        className="auth-right" 
        style={{ width: '51.5%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflowY: 'auto', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        
        <div className="auth-header" style={{ marginBottom: '1.875rem' }}>
          <h2>Welcome Back !</h2>
        </div>

        {errorMsg && (
          <motion.div 
            className="w-full max-w-[34.125rem] px-6"
            style={{ color: 'var(--status-red)', marginBottom: '1.25rem', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {errorMsg}
          </motion.div>
        )}

        <form className="form-container" onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div className="w-full max-w-[34.125rem] px-6" style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ width: '100%', marginBottom: errors.userId ? '0.3125rem' : '1.875rem' }}
              placeholder="Enter ID" 
              {...register('userId')}
            />
            {errors.userId && (
              <span className="text-red-500 text-base block mb-4 pl-4 font-semibold text-left w-full">
                {errors.userId.message}
              </span>
            )}
          </div>

          <div className="w-full max-w-[34.125rem] px-6" style={{ position: 'relative' }}>
            <select 
              className="input-field" 
              style={{ width: '100%', marginBottom: '1.875rem' }}
              {...register('nozzle')}
            >
              <option value="">Select Nozzle (Workers Only)</option>
              <option value="A">Nozzle A (Petrol)</option>
              <option value="B">Nozzle B (Diesel)</option>
            </select>
          </div>

          <div className="w-full max-w-[34.125rem] px-6" style={{ position: 'relative' }}>
            <input 
              type="password" 
              className="input-field" 
              style={{ width: '100%', marginBottom: errors.password ? '0.3125rem' : '1.875rem' }}
              placeholder="Enter Password" 
              {...register('password')}
            />
            {errors.password && (
              <span className="text-red-500 text-base block mb-4 pl-4 font-semibold text-left w-full">
                {errors.password.message}
              </span>
            )}
          </div>
          
          <div className="login-options w-full max-w-[34.125rem] px-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.875rem' }}>
            <label 
              className="keep-logged-in" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '1rem', cursor: 'pointer' }}
            >
              <input type="checkbox" className="w-5 h-5 rounded accent-blue-600 cursor-pointer" />
              Keep me logged in
            </label>
            <a 
              href="#" 
              className="forgot-pwd" 
              onClick={(e) => {
                e.preventDefault();
                alert('Password recovery is not configured. Use demo credentials or register a new worker.');
              }}
              style={{ fontSize: '1rem', color: 'var(--bp-navy-dark)', textDecoration: 'none' }}
            >
              Forgot Password
            </a>
          </div>

          <div className="w-full max-w-[34.125rem]" style={{ paddingLeft: '1.25rem', paddingRight: '1.25rem', position: 'relative' }}>
            <button type="submit" className="btn-primary auth-btn w-full">Log in</button>
          </div>
        </form>

        {/* Quick Demo Logins Card */}
        <motion.div 
          className="w-full max-w-[34.125rem]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginTop: '0.625rem', padding: '1.5rem', backgroundColor: 'var(--bg-light-gray)', borderRadius: '1rem', border: '1px solid var(--border-gray)' }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bp-navy)', marginBottom: '0.9375rem', textAlign: 'center' }}>
            Quick Demo Logins (Click to Log In):
          </div>
          <div style={{ display: 'flex', gap: '0.9375rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button"
              onClick={() => loginAsUser('superadmin', 'superadmin', '')}
              className="btn-primary"
              style={{ width: '8.75rem', height: '2rem', fontSize: '1rem', padding: '0' }}
            >
              Super Admin
            </button>
            <button 
              type="button"
              onClick={() => loginAsUser('admin', 'admin', '')}
              className="btn-primary"
              style={{ width: '8.75rem', height: '2rem', fontSize: '1rem', padding: '0', backgroundColor: 'var(--bp-navy-dark)', color: '#fff' }}
            >
              Admin
            </button>
            <button 
              type="button"
              onClick={() => loginAsUser('worker', 'worker', 'A')}
              className="btn-primary"
              style={{ width: '8.75rem', height: '2rem', fontSize: '1rem', padding: '0', backgroundColor: 'var(--status-green-dark)', color: '#fff' }}
            >
              Worker
            </button>
          </div>
        </motion.div>

        <div className="signup-text" style={{ fontSize: '1rem', marginTop: '1.25rem', display: 'flex', gap: '0.625rem' }}>
          <span>Don't have an account?</span>
          <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); navigate('/register'); }} style={{ color: 'var(--bp-navy)', textDecoration: 'none', fontWeight: 700 }}>Sign Up</a>
        </div>

        <div className="auth-footer" style={{ marginTop: '2.5rem', marginBottom: '1.25rem', fontSize: '1rem' }}>
          Terms of Use | Privacy Policy
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

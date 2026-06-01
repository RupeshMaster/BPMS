import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/Toast';
import api from '../utils/api';

// Define Zod registration schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').regex(/^\+?[0-9\s\-]+$/, 'Invalid phone number'),
  dob: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(5, 'Address must be at least 5 characters').trim(),
});

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.3038 3 12.5911 3.13809 12.7809 3.3753L16.7809 8.37531C17.1259 8.80657 17.056 9.43586 16.6247 9.78087C16.1934 10.1259 15.5641 10.056 15.2191 9.62469L13 6.85078L13 14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14L11 6.85078L8.78087 9.62469C8.43586 10.056 7.80657 10.1259 7.37531 9.78087C6.94404 9.43586 6.87412 8.80657 7.21913 8.37531L11.2191 3.3753C11.4089 3.13809 11.6962 3 12 3ZM3 15C3 13.8954 3.89543 13 5 13H7C7.55228 13 8 13.4477 8 14C8 14.5523 7.55228 15 7 15H5V19H19V15H17C16.4477 15 16 14.5523 16 14C16 13.4477 16.4477 13 17 13H19C20.1046 13 21 13.8954 21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15ZM16 17C16 16.4477 16.4477 16 17 16H17.01C17.5623 16 18.01 16.4477 18.01 17C18.01 17.5523 17.5623 18 17.01 18H17C16.4477 18 16 17.5523 16 17Z" fill="currentColor" />
  </svg>
);

export const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [lang, setLang] = useState('English');

  // File states
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // Refs for files
  const aadharRef = useRef();
  const panRef = useRef();
  const imageRef = useRef();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone: '',
      dob: '',
      address: ''
    }
  });

  const handleLanguageToggle = () => {
    const nextLang = lang === 'English' ? 'हिन्दी (Hindi)' : 'English';
    setLang(nextLang);
    showToast(`Language switched to ${nextLang}`);
  };

  const handleFileChange = (e, fileType) => {
    if (e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      const shortened = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;

      if (fileType === 'aadhar') setAadharFile(shortened);
      if (fileType === 'pan') setPanFile(shortened);
      if (fileType === 'image') setImageFile(shortened);

      showToast(`Uploaded ${fileName} successfully.`);
    }
  };

  const onSubmit = async (data) => {
    if (!aadharFile) {
      showToast('Aadhar Card is required.', 'error');
      return;
    }
    if (!panFile) {
      showToast('PAN Card is required.', 'error');
      return;
    }
    if (!imageFile) {
      showToast('Worker Image is required.', 'error');
      return;
    }

    const cleanName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const id = (cleanName || 'worker') + data.phone.slice(-4);

    try {
      // Call backend auth registration endpoint
      const response = await api.post('/auth/register', {
        id,
        name: data.name,
        phone: data.phone,
        dob: data.dob,
        address: data.address,
        password: '1234' // Default password
      });

      setGeneratedId(id);
      setShowSuccessModal(true);
      showToast('Registration Successful!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error during worker registration.';
      showToast(msg, 'error');
    }
  };

  return (
    <div className="register-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100dvh', overflowY: 'auto', paddingTop: '1.625rem', paddingBottom: '7.5rem', backgroundColor: '#fff', position: 'absolute', top: 0, left: 0, zIndex: 100, width: '100%' }}>

      <div className="auth-header" style={{ marginBottom: '2.5rem' }}>
        <h2>Register To Get Started</h2>
      </div>

      <motion.form
        className="form-container"
        style={{ marginTop: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="register-grid grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 w-full max-w-[70rem] px-6 mb-[1.875rem]">

          {/* Name Field */}
          <div>
            <input
              type="text"
              className="input-field"
              style={{ width: '100%', marginBottom: errors.name ? '0.3125rem' : '0px' }}
              placeholder="Enter Name"
              {...register('name')}
            />
            {errors.name && (
              <span className="text-red-500 text-base block pl-4 font-semibold text-left">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <input
              type="tel"
              className="input-field"
              style={{ width: '100%', marginBottom: errors.phone ? '0.3125rem' : '0px' }}
              placeholder="Enter phone Number"
              {...register('phone')}
            />
            {errors.phone && (
              <span className="text-red-500 text-base block pl-4 font-semibold text-left">
                {errors.phone.message}
              </span>
            )}
          </div>

          {/* DOB Field */}
          <div>
            <input
              type="text"
              className="input-field"
              style={{ width: '100%', marginBottom: errors.dob ? '0.3125rem' : '0px' }}
              placeholder="Enter Date of Birth"
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
              {...register('dob')}
            />
            {errors.dob && (
              <span className="text-red-500 text-base block pl-4 font-semibold text-left">
                {errors.dob.message}
              </span>
            )}
          </div>

          {/* Aadhar Upload */}
          <div
            className={`input-field upload-field flex items-center justify-between cursor-pointer border ${aadharFile ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
            onClick={() => aadharRef.current.click()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: 0
            }}
          >
            <span>{aadharFile ? 'Aadhar Uploaded' : 'Upload Aadhar Card'}</span>
            <input
              type="file"
              ref={aadharRef}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'aadhar')}
            />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-green-dark)' }}>
              {aadharFile ? aadharFile : <UploadIcon />}
            </span>
          </div>

          {/* PAN Upload */}
          <div
            className={`input-field upload-field flex items-center justify-between cursor-pointer border ${panFile ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
            onClick={() => panRef.current.click()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: 0
            }}
          >
            <span>{panFile ? 'PAN Uploaded' : 'Upload PAN Card'}</span>
            <input
              type="file"
              ref={panRef}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'pan')}
            />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--status-green-dark)' }}>
              {panFile ? panFile : <UploadIcon />}
            </span>
          </div>

          {/* Image Upload */}
          <div
            className={`input-field upload-field flex items-center justify-between cursor-pointer border ${imageFile ? 'border-green-500 bg-green-50' : 'border-transparent'}`}
            onClick={() => imageRef.current.click()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              marginBottom: 0
            }}
          >
            <span>{imageFile ? 'Photo Uploaded' : 'Upload Image'}</span>
            <input
              type="file"
              ref={imageRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
            />
            <span style={{ fontSize: '1rem', color: 'var(--status-green-dark)' }}>
              {imageFile ? imageFile : <UploadIcon />}
            </span>
          </div>

          {/* Address Field */}
          <div className="col-span-1 md:col-span-2">
            <textarea
              className="input-field address-field"
              placeholder="Enter Address"
              style={{ width: '100%', height: '9.5625rem', borderRadius: '0.75rem', resize: 'none', padding: '1.875rem 2.5rem', marginBottom: errors.address ? '0.3125rem' : '0px' }}
              {...register('address')}
            ></textarea>
            {errors.address && (
              <span className="text-red-500 text-base block pl-4 font-semibold text-left">
                {errors.address.message}
              </span>
            )}
          </div>
        </div>

        <div className="w-full max-w-[30.5rem]" style={{ marginTop: '2.5rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
          <button type="submit" className="btn-primary auth-btn w-full">Register</button>
        </div>
      </motion.form>

      <div className="login-text" style={{ fontSize: '1rem', marginTop: '1.25rem', display: 'flex', gap: '0.625rem' }}>
        <span>Already have an account?</span>
        <a href="#" className="login-link" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{ color: 'var(--bp-navy)', textDecoration: 'none', fontWeight: 700 }}>Log In</a>
      </div>

      <div className="auth-footer" style={{ marginTop: '2.5rem', fontSize: '1rem' }}>
        Terms of Use | Privacy Policy
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, alignItems: 'center', justifycontent: 'center' }}>
            <motion.div
              style={{ background: 'var(--bg-white)', border: '2px solid var(--text-black)', borderRadius: '1rem', padding: '2.5rem', width: '34.375rem', margin: 'auto', textAlign: 'center', fontFamily: 'var(--font-family)', boxShadow: 'var(--shadow-lg)' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--bp-blue)', marginBottom: '1.25rem' }}>Registration Successful!</div>
              <div style={{ fontSize: '1rem', marginBottom: '1.875rem', lineHeight: 1.6, textAlign: 'left' }}>
                Welcome to Bharat Petroleum. Your worker registration details have been saved successfully.<br /><br />
                <div style={{ background: 'var(--bg-light-gray)', padding: '0.9375rem', borderRadius: '0.625rem', border: '1px solid var(--border-gray)' }}>
                  <strong>Login ID:</strong> <span style={{ color: 'var(--status-red-dark)', fontWeight: 700, fontSize: '1rem' }}>{generatedId}</span><br />
                  <strong>Default Password:</strong> <span style={{ color: 'var(--status-red-dark)', fontWeight: 700, fontSize: '1rem' }}>1234</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/login');
                }}
                className="btn-primary"
                style={{ width: '13.75rem', height: '2.75rem', fontSize: '1rem', borderRadius: '0.75rem', margin: '0 auto', textDecoration: 'none' }}
              >
                Go to Login
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;

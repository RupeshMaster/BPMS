/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="toast-container"
        style={{
          position: 'fixed',
          bottom: '1.875rem',
          right: '1.875rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            style={{
              minWidth: '15.625rem',
              padding: '0.9375rem 1.5625rem',
              borderRadius: '0.625rem',
              backgroundColor: toast.type === 'success' ? 'var(--bp-blue)' : 'var(--status-red-dark)',
              color: toast.type === 'success' ? 'var(--bp-yellow)' : '#fff',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '1rem',
              fontWeight: 700,
              border: '1px solid var(--text-black)',
              animation: 'slideIn 0.3s ease forwards'
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

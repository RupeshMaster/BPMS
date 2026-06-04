import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from './Toast';

export const Navbar = ({ userSession, onLogout, isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { i18n } = useTranslation();

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
    showToast(`Language switched to ${nextLang === 'en' ? 'English' : 'हिन्दी (Hindi)'}`);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="navbar flex items-center justify-between h-[5.375rem] w-full border-b border-black bg-white px-6 md:px-10 relative z-40">
      <div className="flex items-center gap-6">
        {/* Hamburger Menu Toggler (Mobile/Tablet only) */}
        {userSession && (
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center p-2 rounded-md hover:bg-slate-100 border border-slate-200 cursor-pointer"
            style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'transparent' }}
            title={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <svg 
              className="w-6 h-6 stroke-slate-800" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ width: '2rem', height: '2rem' }}
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
        
        {/* Logo and Brand */}
        <div 
          className="logo-container" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem' }}
        >
          <div 
            className="bp-logo-wrapper w-[2.75rem] h-[2.75rem] lg:w-[4rem] lg:h-[4rem]" 
            style={{ 
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              boxShadow: '0 2px 0.3125rem rgba(0,0,0,0.1)'
            }}
          >
            <img 
              src="/assets/logo.png" 
              alt="BP Logo" 
              className="bp-logo-img"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <div 
            className="logo-text text-base sm:text-xl lg:text-[1.75rem] font-bold" 
            style={{ fontWeight: 800, color: 'var(--bp-navy)', letterSpacing: '1px' }}
          >
            <span className="hidden sm:inline">Bharat Petroleum</span>
            <span className="sm:hidden inline">BPCL</span>
          </div>
        </div>
      </div>
      
      <div className="navbar-right flex items-center gap-6 md:gap-10">
        <div className="language-selector" onClick={handleLanguageToggle}>
          <span>{i18n.language === 'en' ? 'EN' : 'HI'}</span>
          <svg className="dropdown-icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </div>


      </div>
    </nav>
  );
};

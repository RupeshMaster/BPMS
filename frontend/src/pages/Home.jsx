import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Home = ({ userSession }) => {
  const navigate = useNavigate();

  const handleMainAction = (e) => {
    e.preventDefault();
    if (userSession) {
      navigate(`/${userSession.role}`);
    } else {
      navigate('/login');
    }
  };

  const handleSecondaryAction = (e) => {
    e.preventDefault();
    navigate('/register');
  };

  // Stagger variants for feature cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <main className="hero-section">
      <div className="hero-overlay"></div>

      <div className="hero-content-wrapper w-full h-full relative z-10 flex flex-col justify-between">

        {/* Main Text Content */}
        <div className="hero-content flex-1 flex flex-col justify-center h-full">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hero-title"
          >
            <span className="whitespace-nowrap">Driving Efficiency across</span><br className="md:hidden" /> every shift
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hero-subtitle text-white/90 text-lg md:text-[28px] font-light max-w-[42rem] md:max-w-[60rem] leading-[1.6]"
            style={{ marginBottom: '35px' }}
          >
            The official centralized portal for BPCL Station Managers, Administrators, and Workers to streamline daily operations, track inventory, and generate instant reports.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hero-actions flex flex-col sm:flex-row gap-5.5"
          >
            <button onClick={handleMainAction} className="btn-primary btn-large shadow-lg">
              {userSession ? 'Go to Dashboard' : 'Log In to Portal'}
            </button>

            {!userSession && (
              <button
                onClick={handleSecondaryAction}
                className="btn-primary btn-large shadow-lg"
              >
                New Worker Registration
              </button>
            )}
          </motion.div>
        </div>


      </div>
    </main>
  );
};

export default Home;

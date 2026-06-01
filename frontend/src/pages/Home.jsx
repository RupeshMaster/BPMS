import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Home = ({ userSession }) => {
  const navigate = useNavigate();

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (userSession) {
      navigate(`/${userSession.role}`);
    } else {
      navigate('/register');
    }
  };

  return (
    <main className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">Driving Efficiency across every shift</h1>
        <button onClick={handleRegisterClick} className="btn-primary btn-large">
          {userSession ? 'Go to Dashboard' : 'Register Now'}
        </button>
      </div>
    </main>
  );
};

export default Home;

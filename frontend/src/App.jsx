import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSession } from './store/sessionSlice';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Protective Route Middleware
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userSession = useSelector((state) => state.session.currentSession);
  
  if (!userSession) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userSession.role)) {
    // Reroute to appropriate view based on role
    if (userSession.role === 'worker') return <Navigate to="/worker" replace />;
    if (userSession.role === 'admin') return <Navigate to="/admin" replace />;
    if (userSession.role === 'super-admin') return <Navigate to="/super-admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const dispatch = useDispatch();
  const userSession = useSelector((state) => state.session.currentSession);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch(logoutSession());
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };



  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-white">
        {/* Unified Top Navbar */}
        <Navbar 
          userSession={userSession} 
          onLogout={handleLogout} 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
        />

        {/* Dashboard and Tab Contents */}
        <div className="flex-grow relative page-content">
          <Routes>
            <Route path="/" element={<Home userSession={userSession} />} />
            
            <Route 
              path="/login" 
              element={
                userSession ? (
                  <Navigate to={`/${userSession.role}`} replace />
                ) : (
                  <Login />
                )
              } 
            />
            
            <Route 
              path="/register" 
              element={
                userSession ? (
                  <Navigate to={`/${userSession.role}`} replace />
                ) : (
                  <Register />
                )
              } 
            />

            {/* Protected Role-Based Routers */}
            <Route 
              path="/worker" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard 
                    userSession={userSession} 
                    onLogout={handleLogout} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                  />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard 
                    userSession={userSession} 
                    onLogout={handleLogout} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                  />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/super-admin" 
              element={
                <ProtectedRoute allowedRoles={['super-admin']}>
                  <SuperAdminDashboard 
                    userSession={userSession} 
                    onLogout={handleLogout} 
                    isSidebarOpen={isSidebarOpen} 
                    setIsSidebarOpen={setIsSidebarOpen} 
                  />
                </ProtectedRoute>
              } 
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

import React from 'react';

export const Sidebar = ({ userSession, activeTab, setActiveTab, onLogout, isOpen, onClose }) => {
  const isWorker = userSession?.role === 'worker';
  const roleName = isWorker ? 'Worker' : userSession?.role === 'super-admin' ? 'Super Admin' : 'Admin';
  
  const handleLogoutClick = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      onLogout();
      if (onClose) onClose();
    }
  };

  const handleItemClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  // Define menu items based on role
  const workerMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: '/assets/dashboard.png' },
    { id: 'shifts', label: 'Shift Management', icon: '/assets/shifts.png' },
    { id: 'attendance', label: 'My Attendance', icon: '/assets/attendance.png' },
    { id: 'sales-entry', label: 'Sales Entry', icon: '/assets/sales.png' },
    { id: 'nozzles', label: 'Nozzle Management', icon: '/assets/nozzles.png' },
    { id: 'check-in', label: 'Check In', icon: '/assets/checkin.png' },
    { id: 'settings', label: 'Settings', icon: '/assets/settings.png' }
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: '/assets/dashboard.png' },
    { id: 'fuel', label: 'Fuel Management', icon: '/assets/nozzles.png' },
    { id: 'nozzles', label: 'Nozzle Management', icon: '/assets/nozzles.png' },
    { id: 'workers', label: 'Worker Management', icon: '/assets/avatar.png' },
    { id: 'entries', label: 'Daily Entries', icon: '/assets/attendance.png' },
    { id: 'shifts', label: 'Shift Management', icon: '/assets/shifts.png' },
    { id: 'expenses', label: 'Expense Tracking', icon: '/assets/sales.png' },
    { id: 'generator', label: 'Generator Management', icon: '/assets/settings.png' },
    { id: 'sales-analysis', label: 'Sales Analysis', icon: '/assets/sales.png' },
    { id: 'reports', label: 'Reports', icon: '/assets/attendance.png' },
    { id: 'settings', label: 'Settings', icon: '/assets/settings.png' }
  ];

  const menuItems = isWorker ? workerMenu : adminMenu;

  return (
    <>
      {/* Mobile sidebar overlay backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Navigation Menu */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li 
              key={item.id} 
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <div className="menu-item-left">
                <img 
                  src={item.icon} 
                  alt={item.label} 
                  className="menu-icon" 
                  style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    objectFit: 'contain',
                    transform: item.id === 'dashboard' ? 'scale(1.5)' : 'none'
                  }} 
                />
                <span>{item.label}</span>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer Profile Section */}
        <div className="sidebar-footer">
          <div className="user-profile flex-between">
            <div className="flex-between" style={{ gap: '0.9375rem' }}>
              <img 
                src="/assets/avatar.png" 
                alt="Avatar" 
                className="user-avatar" 
                style={{ 
                  width: '2.75rem', 
                  height: '2.75rem', 
                  borderRadius: '50%', 
                  border: '2px solid var(--bp-blue)', 
                  objectFit: 'cover' 
                }} 
              />
              <div className="flex-column">
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                  {userSession?.name?.split(' ')[0] || 'User'}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-gray)' }}>{roleName}</span>
              </div>
            </div>
            
            {/* Logout Button */}
            <div 
              onClick={handleLogoutClick}
              title="Click to log out"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#ffeeee', color: '#ff4d4f', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffd6d6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffeeee'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

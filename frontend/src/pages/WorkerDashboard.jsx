import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { 
  fetchInitialData,
  addSaleThunk,
  toggleCheckInThunk
} from '../store/dataSlice';

export const WorkerDashboard = ({ userSession, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weather, setWeather] = useState(null);
  
  // Select data from Redux Store
  const shifts = useSelector((state) => state.data.shifts);
  const allAttendance = useSelector((state) => state.data.attendance);
  const nozzles = useSelector((state) => state.data.nozzles);
  const sales = useSelector((state) => state.data.sales);
  const stocks = useSelector((state) => state.data.stocks);
  const users = useSelector((state) => state.data.users);
  
  const workerDetails = users[userSession?.id] || {};
  const myLogs = allAttendance.filter(log => log.workerId === userSession?.id);
  const checkinsCount = myLogs.length;
  const activeLog = myLogs.find(log => log.status === 'Active');

  // Stats State
  const [stats, setStats] = useState({
    attendanceVal: '0/30',
    daysVal: '250/365',
    salesToday: '₹0',
    isCheckedIn: false,
    checkInTime: '',
    checkInDate: '',
    totalLiters: 0,
    totalAmount: 0,
    cashCollected: 0,
    digitalAmount: 0
  });

  // Sales Form states
  const [salesNozzle, setSalesNozzle] = useState('A');
  const [salesFuel, setSalesFuel] = useState('Petrol');
  const [salesRate, setSalesRate] = useState(104.2);
  const [salesLiters, setSalesLiters] = useState('');
  const [salesEstAmount, setSalesEstAmount] = useState(0);
  const [salesPayment, setSalesPayment] = useState('Cash');

  // Load backend data on mount
  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  // Load / recalculate stats whenever sales, attendance or user changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.workerId === userSession?.id && s.date.startsWith(today));
    
    let totalLiters = 0;
    let totalAmount = 0;
    let cashCollected = 0;
    let digitalAmount = 0;

    todaySales.forEach(s => {
      totalLiters += s.liters;
      totalAmount += s.amount;
      cashCollected += s.cash || 0;
      digitalAmount += s.digital || 0;
    });

    setStats({
      attendanceVal: `${checkinsCount}/30`,
      daysVal: `${250 + checkinsCount}/365`,
      salesToday: `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      isCheckedIn: !!activeLog,
      checkInTime: activeLog?.checkIn || '',
      checkInDate: activeLog?.date || '',
      totalLiters,
      totalAmount,
      cashCollected,
      digitalAmount
    });
  }, [sales, allAttendance, userSession?.id, checkinsCount, activeLog]);

  // Handle sales nozzle change rate
  useEffect(() => {
    const selected = nozzles[salesNozzle];
    if (selected) {
      setSalesFuel(selected.fuel);
      setSalesRate(selected.fuel === 'Petrol' ? 104.2 : 92.5);
    }
  }, [salesNozzle, nozzles]);

  // Handle sales estimation amount
  useEffect(() => {
    const liters = parseFloat(salesLiters) || 0;
    setSalesEstAmount(liters * salesRate);
  }, [salesLiters, salesRate]);

  // Actions
  const handleCheckInToggle = () => {
    dispatch(toggleCheckInThunk({
      workerId: userSession.id,
      workerName: userSession.name,
      isCheckedIn: stats.isCheckedIn
    })).then((res) => {
      if (!res.error) {
        showToast(stats.isCheckedIn ? 'Checked out successfully!' : 'Checked in successfully!');
      } else {
        showToast('Shift attendance action failed.', 'error');
      }
    });
  };

  const handleSalesSubmit = (e) => {
    e.preventDefault();
    const liters = parseFloat(salesLiters) || 0;
    
    if (liters <= 0) {
      showToast('Please enter a valid quantity of liters.', 'error');
      return;
    }

    const nozzle = nozzles[salesNozzle];
    if (!nozzle) return;

    const rate = nozzle.fuel === 'Petrol' ? 104.2 : 92.5;
    const amount = liters * rate;
    const fuelKey = nozzle.fuel.toLowerCase(); // 'petrol' or 'diesel'
    
    // Validate stock
    if (stocks[fuelKey].current < liters) {
      showToast(`Insufficient stock! Only ${stocks[fuelKey].current} L remaining.`, 'error');
      return;
    }

    // Verify check-in status
    if (!stats.isCheckedIn) {
      if (!window.confirm('Warning: You are currently not checked in. Log this sale anyway?')) {
        return;
      }
    }

    // Add sale via Redux thunk
    const cashAmount = salesPayment === 'Cash' ? amount : 0;
    const digitalAmount = salesPayment === 'Digital' ? amount : 0;
    
    dispatch(addSaleThunk({
      workerId: userSession.id,
      workerName: userSession.name,
      nozzle: salesNozzle,
      fuel: nozzle.fuel,
      liters: liters,
      amount: amount,
      payment: salesPayment,
      cash: cashAmount,
      digital: digitalAmount
    })).then((res) => {
      if (!res.error) {
        showToast(`Logged sale of ${liters}L ${nozzle.fuel} successfully!`);
        setSalesLiters('');
      } else {
        showToast(res.payload?.message || 'Error logging sale.', 'error');
      }
    });
  };

  const handleExportCSV = () => {
    const mySales = sales.filter(s => s.workerId === userSession?.id);
    
    if (mySales.length === 0) {
      showToast('No sales records found to export.', 'error');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Sale ID,Nozzle,Fuel,Liters,Amount (INR),Payment Mode,Timestamp\n';
    
    mySales.forEach(s => {
      csvContent += `${s.id || s._id},Nozzle ${s.nozzle},${s.fuel},${s.liters},${s.amount},${s.payment},${s.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_export_${userSession?.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully.');
  };

  // Rendering panels with Framer Motion wrapper
  const renderDashboardPanel = () => {
    const initialNozzle = userSession?.nozzle || 'A';
    const activeShift = shifts.find(s => s.status === 'Active') || { name: 'Morning Shift', time: '6:00 AM - 12:00 PM', workersCount: 15, onboardCount: 8 };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="cards-row">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Attendance</div>
            <div className="dashboard-card-value">{stats.attendanceVal}</div>
            <div className={`dashboard-card-subtext ${stats.isCheckedIn ? 'text-green' : 'text-red'}`}>
              {stats.isCheckedIn ? 'Checked in' : 'Not Checked in'}
            </div>
            <img src="/assets/attendance.png" alt="Attendance" className="card-icon-right" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Days Worked</div>
            <div className="dashboard-card-value">{stats.daysVal}</div>
            <div className="dashboard-card-subtext text-green">Registered worker log</div>
            <img src="/assets/shifts.png" alt="Shifts" className="card-icon-right" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Sales (Today)</div>
            <div className="dashboard-card-value">{stats.salesToday}</div>
            <div className="dashboard-card-subtext text-green">Shift transactions</div>
            <img src="/assets/sales.png" alt="Sales" className="card-icon-right" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="main-content-row">
          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Current Shift Status</div>
            
            <div className="shift-info-card">
              <div className="flex-column">
                <span className="text-xl font-bold">{activeShift.name}</span>
                <span style={{ fontSize: '1rem' }}>{activeShift.time}</span>
              </div>
              <div className="status-badge" style={{ backgroundColor: activeShift.status === 'Active' ? 'var(--status-green)' : 'var(--text-gray)' }}>
                {activeShift.status || 'Active'}
              </div>
            </div>

            <div className="shift-info-card">
              <span className="text-xl font-bold">Total Workers on Shift</span>
              <span className="text-xl font-bold">{activeShift.workersCount}</span>
            </div>

            <div className="shift-info-card">
              <span className="text-xl font-bold">Currently Onboard</span>
              <span className="text-xl font-bold">{activeShift.onboardCount}</span>
            </div>
          </div>

          <div className="panel-card panel-card-up">
            <div className="panel-title">Current Shift Sales</div>
            
            <div className="flex-between mb-20 text-xl font-bold">
              <span>Sales during shift</span>
              <span className="text-slate-400">
                {(stats.totalLiters || 0).toFixed(1)} / 8,000 L
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--border-gray)', margin: '1.25rem 0' }} />

            <div className="flex-between mb-10 text-[0.875rem] font-bold">
              <span>Total Payments</span>
              <span style={{ color: 'var(--status-orange)' }}>
                ₹{(stats.totalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex-between mb-10 text-[0.625rem] font-bold">
              <span>Cash Collected</span>
              <span style={{ color: 'var(--status-red-dark)' }}>
                ₹{(stats.cashCollected || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex-between mb-20 text-[0.625rem] font-bold">
              <span>Digital Payment</span>
              <span>
                ₹{(stats.digitalAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--border-gray)', margin: '1.25rem 0' }} />

            <div className="flex-between text-[0.875rem] font-bold">
              <span>Assigned Duty</span>
              <span style={{ color: '#ff04f2', fontSize: '1rem' }}>
                Nozzle {initialNozzle} ({nozzles[initialNozzle]?.fuel || 'Petrol'})
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderShiftsPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="panel-title">Assigned Shifts Schedule</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {shifts.map((shift) => (
              <div key={shift.id || shift._id} className="shift-info-card">
                <div className="flex-column">
                  <span className="text-xl font-bold">{shift.name}</span>
                  <span style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>{shift.time}</span>
                  <span style={{ fontSize: '0.8125rem', marginTop: '0.3125rem' }}>Workers allocated: <strong>{shift.workersCount}</strong></span>
                </div>
                <div className="status-badge" style={{ backgroundColor: shift.status === 'Active' ? 'var(--status-green)' : 'var(--border-gray)', color: shift.status === 'Active' ? 'var(--text-black)' : 'var(--text-gray)' }}>
                  {shift.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAttendancePanel = () => {
    const reverseAttendance = [...myLogs].reverse();
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="panel-title">My Attendance History</div>
          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-family)', fontSize: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--text-black)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Check In</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Check Out</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reverseAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-gray)' }}>
                      No attendance logs recorded.
                    </td>
                  </tr>
                ) : (
                  reverseAttendance.map((log, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>{log.date}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>{log.checkIn}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>{log.checkOut || '--:--'}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span 
                          style={{ 
                            backgroundColor: log.status === 'Active' ? 'var(--status-green)' : 'var(--status-green-dark)', 
                            color: log.status === 'Active' ? 'var(--text-black)' : '#fff', 
                            padding: '4px 12px', 
                            borderRadius: '0.75rem', 
                            fontSize: '1rem', 
                            fontWeight: 700 
                          }}
                        >
                          {log.status === 'Active' ? 'On Duty' : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSalesEntryPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card panel-card-up max-w-xl mx-auto rounded-2xl">
          <div className="panel-title text-center mb-6">Log Shift Sales</div>
          <form onSubmit={handleSalesSubmit} className="flex flex-col gap-6">
            <div>
              <label className="font-bold block text-base" style={{ paddingLeft: '1rem', marginBottom: '0.75rem' }}>Select Nozzle</label>
              <select 
                className="input-field w-full h-12 text-base mb-0" 
                value={salesNozzle}
                onChange={(e) => setSalesNozzle(e.target.value)}
                required
              >
                <option value="A">Nozzle A (Petrol)</option>
                <option value="B">Nozzle B (Diesel)</option>
              </select>
            </div>
            <div>
              <label className="font-bold block text-base" style={{ paddingLeft: '1rem', marginBottom: '0.75rem' }}>Fuel Type</label>
              <input 
                type="text" 
                className="input-field w-full h-12 text-base mb-0 bg-slate-200 cursor-not-allowed" 
                value={salesFuel}
                readOnly
              />
            </div>
            <div>
              <label className="font-bold block text-base" style={{ paddingLeft: '1rem', marginBottom: '0.75rem' }}>Liters Dispensed</label>
              <input 
                type="number" 
                className="input-field w-full h-12 text-base mb-0" 
                placeholder="Enter liters" 
                min="0.1" 
                step="0.01" 
                value={salesLiters}
                onChange={(e) => setSalesLiters(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="font-bold block text-base" style={{ paddingLeft: '1rem', marginBottom: '0.75rem' }}>Current Rate (per Liter)</label>
              <input 
                type="number" 
                className="input-field w-full h-12 text-base mb-0 bg-slate-200 cursor-not-allowed" 
                value={salesRate}
                readOnly
              />
            </div>
            <div className="text-base font-bold text-slate-800 my-2 text-right">
              Estimated Amount: <span style={{ color: 'var(--status-orange)' }}>₹{salesEstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <label className="font-bold block text-base" style={{ paddingLeft: '1rem', marginBottom: '0.75rem' }}>Payment Mode</label>
              <select 
                className="input-field w-full h-12 text-base mb-0" 
                value={salesPayment}
                onChange={(e) => setSalesPayment(e.target.value)}
                required
              >
                <option value="Cash">Cash Payment</option>
                <option value="Digital">Digital Payment</option>
              </select>
            </div>
            <button type="submit" className="btn-primary auth-btn w-full h-12 mt-5 text-xl font-bold">Submit Sales Log</button>
          </form>
        </div>
      </motion.div>
    );
  };

  const renderNozzlesPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="panel-title">Station Nozzle Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(nozzles).map((key) => {
              const nozzle = nozzles[key];
              const isMine = key === (userSession?.nozzle || 'A');
              return (
                <div key={key} className="shift-info-card" style={{ border: isMine ? '2px solid var(--bp-blue)' : '1px solid var(--border-gray)' }}>
                  <div className="flex-column" style={{ gap: '0.3125rem' }}>
                    <span className="text-xl font-bold font-bold">
                      Nozzle {nozzle.id} <span style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>({nozzle.fuel})</span>
                    </span>
                    <span style={{ fontSize: '1rem' }}>
                      Status: <strong style={{ color: nozzle.status === 'Active' ? 'var(--status-green-dark)' : 'var(--status-red-dark)' }}>{nozzle.status}</strong>
                    </span>
                    <span style={{ fontSize: '1rem' }}>
                      Total Meter Reading: <strong>{(nozzle.reading || 0).toLocaleString()} Liters</strong>
                    </span>
                    {isMine && <span style={{ fontSize: '0.75rem', color: 'var(--bp-blue)', fontWeight: 700 }}>★ Your Assigned Duty Nozzle</span>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>Assigned Worker:</span><br />
                    <span className="text-base font-bold">{nozzle.assignedWorker}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCheckInPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card panel-card-up max-w-xl mx-auto text-center py-8 px-6 rounded-2xl p-12">
          <div className="panel-title text-xl font-bold">Shift Log In Console</div>
          <div 
            style={{ 
              fontSize: '1rem', 
              marginBottom: '1rem', 
              lineHeight: 1.6, 
              background: 'var(--bg-light-gray)', 
              padding: '1.5rem', 
              borderRadius: '0.75rem', 
              border: '1px solid var(--border-gray)' 
            }}
          >
            {stats.isCheckedIn ? (
              <>
                Status: <strong style={{ color: 'var(--status-green-dark)', fontSize: '1rem' }}>ON DUTY</strong><br /><br />
                Checked In At: <strong>{stats.checkInTime}</strong><br />
                Date: <strong>{stats.checkInDate}</strong><br />
                Assigned Nozzle: <strong>Nozzle {userSession?.nozzle || 'A'}</strong>
              </>
            ) : (
              <>
                Status: <strong style={{ color: 'var(--status-red-dark)', fontSize: '1rem' }}>OFF DUTY</strong><br /><br />
                Click check-in to begin logging shift metrics, update nozzle readings, and record attendance.
              </>
            )}
          </div>
          <button 
            onClick={handleCheckInToggle}
            className="btn-primary" 
            style={{ 
              width: '17.5rem', 
              height: '5rem', 
              fontSize: '1.75rem', 
              borderRadius: '0.75rem', 
              margin: '0 auto',
              backgroundColor: stats.isCheckedIn ? 'var(--status-red-dark)' : 'var(--bp-blue)',
              color: stats.isCheckedIn ? '#fff' : 'var(--bp-yellow)'
            }}
          >
            {stats.isCheckedIn ? 'Check Out' : 'Check In'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderSettingsPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card max-w-[32rem] mx-auto rounded-xl p-8 border border-slate-200 shadow-lg">
          <div className="panel-title">My Account Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Worker ID:</strong> <span style={{ color: 'var(--text-gray)' }}>{userSession?.id}</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Full Name:</strong> <span>{workerDetails.name || userSession?.name}</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Phone Number:</strong> <span>{workerDetails.phone || 'N/A'}</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Date of Birth:</strong> <span>{workerDetails.dob || 'N/A'}</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Registered Address:</strong> <span>{workerDetails.address || 'N/A'}</span>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <button 
                className="btn-primary" 
                onClick={onLogout}
                style={{ 
                  width: '12.5rem', 
                  height: '2.75rem', 
                  borderRadius: '0.75rem', 
                  fontSize: '1rem', 
                  backgroundColor: 'var(--status-red-dark)', 
                  color: '#fff', 
                  border: 'none', 
                  textDecoration: 'none' 
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 5.375rem)' }}>
      <Sidebar 
        userSession={userSession} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="dashboard-container" style={{ flexGrow: 1 }}>
        <div className="flex-between mb-20">
          <div className="welcome-msg" style={{ marginBottom: 0 }}>
            <div 
              className="user-avatar" 
              style={{ 
                border: '2px solid var(--bp-blue)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 700, 
                color: 'var(--bp-navy)', 
                fontSize: '1rem' 
              }}
            >
              {userSession?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'WK'}
            </div>
            Welcome <span style={{ fontWeight: 700, marginLeft: '0.625rem', marginRight: '0.625rem' }}>{userSession?.name}</span> 
            <img src="/assets/greeting.png" alt="Waving Hand" className="greeting-icon" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain' }} />
          </div>
          
          {activeTab === 'dashboard' && (
            <button 
              onClick={handleExportCSV}
              className="btn-primary" 
              style={{ 
                padding: '0 24px', 
                height: '44px', 
                backgroundColor: 'var(--bg-white)', 
                color: 'var(--text-black)', 
                borderRadius: '12px', 
                fontSize: '14px', 
                fontWeight: 600,
                boxShadow: 'var(--shadow-sm)', 
                border: '1px solid var(--border-gray)' 
              }}
            >
              Export CSV
            </button>
          )}
        </div>

        {/* Tab Panel Switcher */}
        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {activeTab === 'dashboard' && renderDashboardPanel()}
            {activeTab === 'shifts' && renderShiftsPanel()}
            {activeTab === 'attendance' && renderAttendancePanel()}
            {activeTab === 'sales-entry' && renderSalesEntryPanel()}
            {activeTab === 'nozzles' && renderNozzlesPanel()}
            {activeTab === 'check-in' && renderCheckInPanel()}
            {activeTab === 'settings' && renderSettingsPanel()}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default WorkerDashboard;

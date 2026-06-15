/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Sidebar } from '../components/Sidebar';
import { useToast } from '../components/Toast';
import { formatDate } from '../utils/formatDate';
import api from '../utils/api';
import { 
  fetchInitialData,
  refillStockThunk,
  allocateNozzleThunk,
  toggleNozzleThunk,
  toggleWorkerThunk,
  addWorkerThunk,
  updateShiftsThunk,
  addExpenseThunk,
  updateGeneratorThunk,
  resetDatabaseThunk
} from '../store/dataSlice';

export const SuperAdminDashboard = ({ userSession, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');


  // Redux Selectors
  const sales = useSelector((state) => state.data.sales);
  const stocks = useSelector((state) => state.data.stocks);
  const shifts = useSelector((state) => state.data.shifts);
  const attendance = useSelector((state) => state.data.attendance);
  const nozzles = useSelector((state) => state.data.nozzles);
  const users = useSelector((state) => state.data.users);
  const expenses = useSelector((state) => state.data.expenses);
  const generator = useSelector((state) => state.data.generator);

  // Forms states
  const [refillType, setRefillType] = useState('Petrol');
  const [refillLiters, setRefillLiters] = useState('');
  const [refillCost, setRefillCost] = useState('');

  const [allocateNozzleId, setAllocateNozzleId] = useState('A');
  const [allocateWorkerId, setAllocateWorkerId] = useState('');

  const [addWorkerName, setAddWorkerName] = useState('');
  const [addWorkerPhone, setAddWorkerPhone] = useState('');
  const [addWorkerPass, setAddWorkerPass] = useState('');
  const [addWorkerNozzle, setAddWorkerNozzle] = useState('A');

  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftTime, setNewShiftTime] = useState('');
  const [newShiftWorkers, setNewShiftWorkers] = useState('');

  const [expenseCategory, setExpenseCategory] = useState('Generator Fuel');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');

  const [genLogType, setGenLogType] = useState('refuel');
  const [genLogVal, setGenLogVal] = useState('');

  const [reportSearch, setReportSearch] = useState('');
  const [reportFilterFuel, setReportFilterFuel] = useState('All');

  // Load backend data on mount
  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);


  // Calculations for stats & charts
  let totalRevenue = 0;
  sales.forEach(s => totalRevenue += s.amount);

  let petrolLiters = 0;
  let dieselLiters = 0;
  let cashSales = 0;
  let digitalSales = 0;

  sales.forEach(s => {
    if (s.fuel === 'Petrol') petrolLiters += s.liters;
    else dieselLiters += s.liters;

    cashSales += s.cash || 0;
    digitalSales += s.digital || 0;
  });

  // Group entries by date
  const dateMap = {};
  sales.forEach(s => {
    const date = s.date.split('T')[0];
    if (!dateMap[date]) dateMap[date] = { petrol: 0, diesel: 0, revenue: 0, expenses: 0 };
    if (s.fuel === 'Petrol') dateMap[date].petrol += s.liters;
    else dateMap[date].diesel += s.liters;
    dateMap[date].revenue += s.amount;
  });

  expenses.forEach(e => {
    const date = e.date;
    if (!dateMap[date]) dateMap[date] = { petrol: 0, diesel: 0, revenue: 0, expenses: 0 };
    dateMap[date].expenses += e.amount;
  });

  const sortedDates = Object.keys(dateMap).sort().reverse();

  // Recharts formatted data
  const fuelData = [
    { name: 'Petrol', liters: petrolLiters },
    { name: 'Diesel', liters: dieselLiters }
  ];

  const paymentData = [
    { name: 'Cash', value: cashSales },
    { name: 'Digital', value: digitalSales }
  ];

  const COLORS = ['#0066CC', '#002E5D', '#FF8200', '#32ed25'];

  const trendData = sortedDates.slice(0, 7).reverse().map(date => ({
    date: date.substring(5), // mm-dd
    Petrol: parseFloat(dateMap[date].petrol.toFixed(1)),
    Diesel: parseFloat(dateMap[date].diesel.toFixed(1)),
    Revenue: Math.round(dateMap[date].revenue),
    Expenses: Math.round(dateMap[date].expenses)
  }));

  // Handlers
  const handleRefillSubmit = (e) => {
    e.preventDefault();
    const liters = parseFloat(refillLiters) || 0;
    const cost = parseFloat(refillCost) || 0;

    if (liters <= 0 || cost <= 0) {
      showToast('Please enter valid details.', 'error');
      return;
    }

    const fuelKey = refillType.toLowerCase();
    if (stocks[fuelKey].current + liters > stocks[fuelKey].capacity) {
      showToast(`Cannot overfill tank! Max capacity is ${stocks[fuelKey].capacity} L.`, 'error');
      return;
    }

    dispatch(refillStockThunk({ fuelType: refillType, liters, cost })).then((res) => {
      if (!res.error) {
        showToast(`Added ${liters}L of ${refillType} stock successfully!`);
        setRefillLiters('');
        setRefillCost('');
      } else {
        showToast('Error registering stock refill.', 'error');
      }
    });
  };

  const handleAllocateNozzle = (e) => {
    e.preventDefault();
    const workersList = Object.keys(users).filter(k => users[k].role === 'worker');
    const derivedAllocateWorkerId = allocateWorkerId || (workersList.length > 0 ? users[workersList[0]].id : '');
    const userToAssign = users[derivedAllocateWorkerId];

    if (nozzles[allocateNozzleId] && userToAssign) {
      dispatch(allocateNozzleThunk({
        nozzleId: allocateNozzleId,
        workerId: allocateWorkerId,
        workerName: userToAssign.name
      })).then((res) => {
        if (!res.error) {
          showToast(`Assigned Nozzle ${allocateNozzleId} duty to ${userToAssign.name}!`);
        } else {
          showToast('Allocation request failed.', 'error');
        }
      });
    }
  };

  const handleToggleNozzle = (nozzleId) => {
    if (nozzles[nozzleId]) {
      dispatch(toggleNozzleThunk(nozzleId)).then((res) => {
        if (!res.error) {
          showToast(`Nozzle ${nozzleId} status updated!`);
        } else {
          showToast('Nozzle toggle request failed.', 'error');
        }
      });
    }
  };

  const handleToggleWorkerActive = (workerId) => {
    if (users[workerId]) {
      dispatch(toggleWorkerThunk(workerId)).then((res) => {
        if (!res.error) {
          showToast(`Worker status updated!`);
        } else {
          showToast('Worker toggle status failed.', 'error');
        }
      });
    }
  };

  const handleAddWorker = (e) => {
    e.preventDefault();
    const name = addWorkerName.trim();
    const phone = addWorkerPhone.trim();
    
    if (!name || !phone || !addWorkerPass) {
      showToast('Please fill all worker details.', 'error');
      return;
    }

    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const generatedId = (cleanName || 'worker') + phone.slice(-4);

    if (users[generatedId]) {
      showToast('A worker with this identity already exists!', 'error');
      return;
    }

    dispatch(addWorkerThunk({
      id: generatedId,
      name,
      phone,
      password: addWorkerPass,
      role: 'worker',
      status: 'Active',
      nozzle: addWorkerNozzle === 'None' ? '' : addWorkerNozzle
    })).then((res) => {
      if (!res.error) {
        if (addWorkerNozzle !== 'None') {
          dispatch(allocateNozzleThunk({
            nozzleId: addWorkerNozzle,
            workerId: generatedId,
            workerName: name
          }));
        }
        showToast(`Worker saved successfully! ID: ${generatedId}`);
        setAddWorkerName('');
        setAddWorkerPhone('');
        setAddWorkerPass('');
      } else {
        showToast('Error registering worker account.', 'error');
      }
    });
  };

  const handleAddShift = (e) => {
    e.preventDefault();
    const workersCount = parseInt(newShiftWorkers) || 0;

    if (!newShiftName || !newShiftTime || workersCount <= 0) {
      showToast('Please fill valid shift details.', 'error');
      return;
    }

    const updatedShifts = [...shifts, {
      id: Date.now(),
      name: newShiftName,
      time: newShiftTime,
      workersCount: workersCount,
      onboardCount: 0,
      status: 'Inactive'
    }];

    dispatch(updateShiftsThunk(updatedShifts)).then((res) => {
      if (!res.error) {
        showToast(`Shift '${newShiftName}' added!`);
        setNewShiftName('');
        setNewShiftTime('');
        setNewShiftWorkers('');
      } else {
        showToast('Error saving shift details.', 'error');
      }
    });
  };

  const handleToggleShiftActive = (shiftId) => {
    const updatedShifts = shifts.map(s => {
      if (s.id === shiftId || s._id === shiftId) {
        return { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return { ...s, status: 'Inactive' }; // keep only one active
    });

    dispatch(updateShiftsThunk(updatedShifts)).then((res) => {
      if (!res.error) {
        showToast(`Shift allocations updated!`);
      } else {
        showToast('Error toggling shift status.', 'error');
      }
    });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount) || 0;

    if (amount <= 0 || !expenseDesc) {
      showToast('Please enter valid expense details.', 'error');
      return;
    }

    dispatch(addExpenseThunk({
      category: expenseCategory,
      amount: amount,
      description: expenseDesc,
      date: new Date().toISOString().split('T')[0]
    })).then((res) => {
      if (!res.error) {
        showToast(`Logged expense of ₹${amount.toLocaleString()}`);
        setExpenseAmount('');
        setExpenseDesc('');
      } else {
        showToast('Error registering expense.', 'error');
      }
    });
  };

  const handleToggleGenerator = () => {
    const nextStatus = generator.status === 'ON' ? 'OFF' : 'ON';
    dispatch(updateGeneratorThunk({ status: nextStatus })).then((res) => {
      if (!res.error) {
        showToast(`Generator switched ${nextStatus}!`);
      } else {
        showToast('Error updating power console.', 'error');
      }
    });
  };

  const handleGeneratorLog = (e) => {
    e.preventDefault();
    const val = parseFloat(genLogVal) || 0;

    if (val <= 0) {
      showToast('Please enter a valid value.', 'error');
      return;
    }

    if (genLogType === 'refuel') {
      if (stocks.diesel.current < val) {
        showToast(`Insufficient diesel stock! Only ${stocks.diesel.current}L available.`, 'error');
        return;
      }

      const newDieselLiters = parseFloat((stocks.diesel.current - val).toFixed(2));
      api.put('/fuel/stock', {
        fuelType: 'Diesel',
        current: newDieselLiters
      }).then(() => {
        const nextDieselReserves = parseFloat((generator.dieselLiters + val).toFixed(2));
        dispatch(updateGeneratorThunk({ dieselLiters: nextDieselReserves }));
        
        dispatch(addExpenseThunk({
          category: 'Generator Fuel',
          amount: val * 92.5,
          description: `Refueled generator with ${val}L diesel from primary storage tank`,
          date: new Date().toISOString().split('T')[0]
        }));
        
        showToast(`Added ${val}L to generator fuel reserves.`);
      }).catch(err => {
        showToast('Error updating primary stocks.', 'error');
      });
    } else {
      const fuelConsumed = val * 3.5;
      if (generator.dieselLiters < fuelConsumed) {
        showToast(`Generator ran out of fuel! Requires ${fuelConsumed.toFixed(1)}L but only ${generator.dieselLiters}L remains.`, 'error');
        return;
      }

      dispatch(updateGeneratorThunk({
        hours: parseFloat((generator.hours + val).toFixed(2)),
        dieselLiters: parseFloat((generator.dieselLiters - fuelConsumed).toFixed(2))
      })).then((res) => {
        if (!res.error) {
          showToast(`Logged generator run of ${val} hours. Consumed ${fuelConsumed.toFixed(1)}L diesel.`);
        } else {
          showToast('Generator update failed.', 'error');
        }
      });
    }
    setGenLogVal('');
  };

  const handleResetDatabase = () => {
    if (window.confirm('WARNING: This will wipe all transaction changes, sales, refill logs, and restore the default state. Proceed?')) {
      dispatch(resetDatabaseThunk()).then((res) => {
        if (!res.error) {
          showToast('Database state reset successfully.');
        } else {
          showToast('Reset request failed.', 'error');
        }
      });
    }
  };

  const handleExportCSV = () => {
    if (sales.length === 0) {
      showToast('No sales records to export.', 'error');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Sale ID,Worker,Nozzle,Fuel,Liters,Amount,Payment Mode,Date\n';
    
    sales.forEach(s => {
      csvContent += `${s.id || s._id},"${s.workerName}",Nozzle ${s.nozzle},${s.fuel},${s.liters},${s.amount},${s.payment},${s.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `station_sales_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV report downloaded successfully.');
  };

  // Rendering panels with Framer Motion wrapper
  const renderDashboardPanel = () => {
    const activeShift = shifts.find(s => s.status === 'Active') || { name: 'Morning Shift', time: '6:00 AM - 12:00 PM', workersCount: 15, onboardCount: 8 };
    const activeWorkersCount = attendance.filter(log => log.status === 'Active').length;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="cards-row">
          <div className="dashboard-card">
            <div className="dashboard-card-title">Total Revenue</div>
            <div className="dashboard-card-value">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="dashboard-card-subtext text-green">12% Increase vs yesterday</div>
            <img src="/assets/sales.png" alt="Revenue" className="card-icon-right" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-title">Petrol Stock</div>
            <div className="dashboard-card-value">{stocks.petrol.current.toLocaleString()} L</div>
            <div className="dashboard-card-subtext text-red">
              {Math.round((stocks.petrol.current / stocks.petrol.capacity) * 100)}% capacity
            </div>
            <img src="/assets/nozzles.png" alt="Petrol Stock" className="card-icon-right" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-title">Diesel Stock</div>
            <div className="dashboard-card-value">{stocks.diesel.current.toLocaleString()} L</div>
            <div className="dashboard-card-subtext text-red">
              {Math.round((stocks.diesel.current / stocks.diesel.capacity) * 100)}% capacity
            </div>
            <img src="/assets/nozzles.png" alt="Diesel Stock" className="card-icon-right" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Charts in Dashboard */}
        {trendData.length > 0 && (
          <div className="panel-card panel-card-up" style={{ padding: '2.5rem', marginBottom: '3.125rem' }}>
            <div className="font-bold text-slate-800 text-base mb-4">Revenue Trend (Past Shift Logs)</div>
            <div className="w-full h-[15.625rem]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRevSuper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066CC" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Area type="monotone" dataKey="Revenue" stroke="#0066CC" fillOpacity={1} fill="url(#colorRevSuper)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="main-content-row">
          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Current Shift Status</div>
            
            <div className="shift-info-card">
              <div className="flex-column">
                <span className="text-xl font-bold">{activeShift.name}</span>
                <span style={{ fontSize: '1rem' }}>{activeShift.time}</span>
              </div>
              <div className="status-badge">Active</div>
            </div>

            <div className="shift-info-card">
              <span className="text-xl font-bold">Total workers</span>
              <span className="text-xl font-bold">{activeShift.workersCount}</span>
            </div>

            <div className="shift-info-card">
              <span className="text-xl font-bold">Currently Onboard</span>
              <span className="text-xl font-bold">{activeWorkersCount}</span>
            </div>
          </div>

          <div className="panel-card panel-card-up">
            <div className="panel-title">Quick Actions</div>
            <div className="quick-actions-grid">
              <div className="action-card" onClick={() => setActiveTab('entries')}>
                <img src="/assets/shifts.png" alt="Daily Entry" className="action-icon" style={{ width: '2.25rem', height: '2.25rem', objectFit: 'contain' }} />
                <span>Daily Entry</span>
              </div>
              <div className="action-card" onClick={() => setActiveTab('fuel')}>
                <img src="/assets/nozzles.png" alt="Check Stock" className="action-icon" style={{ width: '2.25rem', height: '2.25rem', objectFit: 'contain' }} />
                <span>Check Stock</span>
              </div>
              <div className="action-card" onClick={() => setActiveTab('workers')}>
                <img src="/assets/attendance.png" alt="Attendance" className="action-icon" style={{ width: '2.25rem', height: '2.25rem', objectFit: 'contain' }} />
                <span>Attendance</span>
              </div>
              <div className="action-card" onClick={() => setActiveTab('reports')}>
                <img src="/assets/sales.png" alt="Reports" className="action-icon" style={{ width: '2.25rem', height: '2.25rem', objectFit: 'contain' }} />
                <span>Reports</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderFuelPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="panel-title">Fuel Storage Tanks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.1875rem', marginTop: '1.25rem' }}>
              <div>
                <div className="flex-between mb-10 text-base font-bold">
                  <span>Petrol Storage Tank</span>
                  <span>{stocks.petrol.current.toLocaleString()} / {stocks.petrol.capacity.toLocaleString()} L</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-light-gray)', height: '1.25rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-gray)' }}>
                  <div style={{ backgroundColor: 'var(--bp-blue)', height: '100%', width: `${Math.min(100, Math.round((stocks.petrol.current / stocks.petrol.capacity) * 100))}%`, transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
              <div>
                <div className="flex-between mb-10 text-base font-bold">
                  <span>Diesel Storage Tank</span>
                  <span>{stocks.diesel.current.toLocaleString()} / {stocks.diesel.capacity.toLocaleString()} L</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-light-gray)', height: '1.25rem', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-gray)' }}>
                  <div style={{ backgroundColor: 'var(--bp-navy)', height: '100%', width: `${Math.min(100, Math.round((stocks.diesel.current / stocks.diesel.capacity) * 100))}%`, transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Refill Fuel Stock</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-gray)', textAlign: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-lg">Read-Only Mode</p>
              <p className="text-sm">Tank refill logging is restricted to Admins.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNozzlesPanel = () => {
    const workersList = Object.keys(users).filter(k => users[k].role === 'worker');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
          <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="panel-title">Nozzle Units</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.keys(nozzles).map((key) => {
                const nozzle = nozzles[key];
                return (
                  <div key={key} className="shift-info-card">
                    <div className="flex-column" style={{ gap: '0.3125rem' }}>
                      <span className="text-xl font-bold font-bold">
                        Nozzle {nozzle.id} <span style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>({nozzle.fuel})</span>
                      </span>
                      <span style={{ fontSize: '1rem' }}>
                        Total Meter Reading: <strong>{(nozzle.reading || 0).toLocaleString()} L</strong>
                      </span>
                      <span style={{ fontSize: '1rem' }}>
                        Running Status: <span style={{ color: nozzle.status === 'Active' ? 'var(--status-green-dark)' : 'var(--status-red-dark)', fontWeight: 700 }}>{nozzle.status}</span>
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-gray)' }}>Allocated:</span><br />
                        <span className="text-base font-bold">{nozzle.assignedWorker}</span>
                      </div>
                      <button 
                        onClick={() => handleToggleNozzle(nozzle.id)}
                        className="btn-primary" 
                        style={{ width: '8.75rem', height: '2rem', borderRadius: '0.3125rem', fontSize: '0.75rem', backgroundColor: '#111', color: '#fff', border: 'none' }}
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Allocate Nozzle Duty</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-gray)', textAlign: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-lg">Read-Only Mode</p>
              <p className="text-sm">Nozzle assignments are managed by Admins.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderWorkersPanel = () => {
    const workersList = Object.keys(users).filter(k => users[k].role === 'worker');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
          <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="panel-title">Registered Workers</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--text-black)' }}>
                    <th style={{ padding: '0.625rem' }}>ID</th>
                    <th style={{ padding: '0.625rem' }}>Name</th>
                    <th style={{ padding: '0.625rem' }}>Phone</th>
                    <th style={{ padding: '0.625rem' }}>Nozzle Duty</th>
                    <th style={{ padding: '0.625rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workersList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-gray)' }}>No workers registered.</td>
                    </tr>
                  ) : (
                    workersList.map((key) => {
                      const u = users[key];
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{u.id}</td>
                          <td style={{ padding: '1rem 1.25rem' }}>{u.name}</td>
                          <td style={{ padding: '1rem 1.25rem' }}>{u.phone}</td>
                          <td style={{ padding: '1rem 1.25rem', color: 'var(--bp-blue)', fontWeight: 700 }}>{u.nozzle ? `Nozzle ${u.nozzle}` : 'None'}</td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <button 
                              onClick={() => handleToggleWorkerActive(u.id)}
                              className="btn-primary" 
                              style={{ 
                                width: '6.875rem', 
                                height: '2rem', 
                                borderRadius: '0.3125rem', 
                                fontSize: '0.75rem', 
                                border: 'none', 
                                backgroundColor: u.status === 'Active' ? 'var(--status-red-dark)' : 'var(--status-green-dark)', 
                                color: '#fff' 
                              }}
                            >
                              {u.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Add Worker Account</div>
            <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input 
                type="text" 
                className="input-field" 
                style={{ width: '100%', height: '2.75rem', marginBottom: 0, fontSize: '1rem' }} 
                placeholder="Full Name" 
                value={addWorkerName}
                onChange={(e) => setAddWorkerName(e.target.value)}
                required 
              />
              <input 
                type="tel" 
                className="input-field" 
                style={{ width: '100%', height: '2.75rem', marginBottom: 0, fontSize: '1rem' }} 
                placeholder="Phone Number" 
                value={addWorkerPhone}
                onChange={(e) => setAddWorkerPhone(e.target.value)}
                required 
              />
              <input 
                type="password" 
                className="input-field" 
                style={{ width: '100%', height: '2.75rem', marginBottom: 0, fontSize: '1rem' }} 
                placeholder="Account Password" 
                value={addWorkerPass}
                onChange={(e) => setAddWorkerPass(e.target.value)}
                required 
              />
              <select 
                className="input-field" 
                style={{ width: '100%', height: '2.75rem', marginBottom: 0, fontSize: '1rem' }} 
                value={addWorkerNozzle}
                onChange={(e) => setAddWorkerNozzle(e.target.value)}
                required
              >
                <option value="A">Nozzle A</option>
                <option value="B">Nozzle B</option>
                <option value="None">None</option>
              </select>
              <button type="submit" className="btn-primary auth-btn w-full h-12 text-xl font-bold mt-[0.625rem]">Save Worker</button>
            </form>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEntriesPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="panel-title">Daily Entry History</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--text-black)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Petrol Sold</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Diesel Sold</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Total Expenses</th>
                  <th style={{ padding: '1rem 1.25rem' }}>Net Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-gray)' }}>No entries logged yet.</td>
                  </tr>
                ) : (
                  sortedDates.map((date) => {
                    const data = dateMap[date];
                    const net = data.revenue - data.expenses;
                    const netColor = net >= 0 ? 'var(--status-green-dark)' : 'var(--status-red-dark)';
                    return (
                      <tr key={date} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{formatDate(date)}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>{data.petrol.toFixed(1)} L</td>
                        <td style={{ padding: '1rem 1.25rem' }}>{data.diesel.toFixed(1)} L</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--status-red-dark)' }}>₹{data.expenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: netColor }}>₹{net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="panel-title">Shift Allocations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {shifts.map((shift) => (
                <div key={shift.id || shift._id} className="shift-info-card">
                  <div className="flex-column" style={{ gap: '0.3125rem' }}>
                    <span className="text-base font-bold">{shift.name}</span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-gray)' }}>{shift.time}</span>
                    <span style={{ fontSize: '0.8125rem' }}>Allocated Workers Count: <strong>{shift.workersCount}</strong></span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="status-badge" style={{ backgroundColor: shift.status === 'Active' ? 'var(--status-green)' : 'var(--border-gray)', fontSize: '1rem', padding: '4px 12px' }}>{shift.status}</span>
                    <button 
                      onClick={() => handleToggleShiftActive(shift.id || shift._id)}
                      className="btn-primary" 
                      style={{ width: '6.875rem', height: '1.25rem', borderRadius: '0.3125rem', fontSize: '0.75rem', backgroundColor: '#111', color: '#fff', border: 'none' }}
                    >
                      Toggle Active
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Create Shift Log</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-gray)', textAlign: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-lg">Read-Only Mode</p>
              <p className="text-sm">Shift management is restricted to Admins.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderExpensesPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
          <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="panel-title">Expense History</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--text-black)' }}>
                    <th style={{ padding: '0.75rem' }}>Date</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Description</th>
                    <th style={{ padding: '0.75rem' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-gray)' }}>No expenses recorded.</td>
                    </tr>
                  ) : (
                    expenses.slice().reverse().map((exp) => (
                      <tr key={exp.id || exp._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                        <td style={{ padding: '0.75rem' }}>{formatDate(exp.date)}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{exp.category}</td>
                        <td style={{ padding: '0.75rem', color: 'var(--text-gray)' }}>{exp.description}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--status-red-dark)' }}>- ₹{exp.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Log Daily Expense</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-gray)', textAlign: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-lg">Read-Only Mode</p>
              <p className="text-sm">Expense management is restricted to Admins.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGeneratorPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="panel-title">Generator Status Console</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.25rem', fontSize: '1rem' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.75rem' }}>
                <span>Current Power Source:</span>
                <span 
                  style={{ 
                    fontWeight: 700, 
                    padding: '4px 12px', 
                    borderRadius: '0.75rem',
                    backgroundColor: generator.status === 'ON' ? 'var(--status-orange)' : 'var(--status-green)',
                    color: generator.status === 'ON' ? '#fff' : 'var(--text-black)'
                  }}
                >
                  {generator.status === 'ON' ? 'Generator ON' : 'Main Grid'}
                </span>
              </div>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.75rem' }}>
                <span>Generator Running Hours:</span>
                <span style={{ fontWeight: 700 }}>{(generator.hours || 0).toFixed(1)} hrs</span>
              </div>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.75rem' }}>
                <span>Diesel Fuel Remaining:</span>
                <span style={{ fontWeight: 700 }}>{(generator.dieselLiters || 0).toFixed(1)} L</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <button 
                  onClick={handleToggleGenerator}
                  className="btn-primary" 
                  style={{ 
                    width: '12rem', 
                    height: '2.75rem', 
                    borderRadius: '0.75rem', 
                    fontSize: '1rem', 
                    margin: '0 auto',
                    backgroundColor: generator.status === 'ON' ? 'var(--status-red-dark)' : 'var(--bp-blue)',
                    color: generator.status === 'ON' ? '#fff' : 'var(--bp-yellow)'
                  }}
                >
                  {generator.status === 'ON' ? 'Switch OFF' : 'Switch ON'}
                </button>
              </div>
            </div>
          </div>

          <div className="panel-card panel-card-up" style={{ borderRadius: '0.75rem', padding: '1.5rem' }}>
            <div className="panel-title">Log Generator Run / Refuel</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-gray)', textAlign: 'center' }}>
              <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-lg">Read-Only Mode</p>
              <p className="text-sm">Generator logging is restricted to Admins.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSalesAnalysisPanel = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="panel-title">Sales Analytics Overview</div>
          
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
            
            {/* Recharts Bar Chart */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.9375rem', textAlign: 'center' }}>
                Fuel Sales Breakdown (Liters)
              </div>
              <div className="w-full h-[15rem]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <BarChart data={fuelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} Liters`} />
                    <Bar dataKey="liters" fill="#0066CC">
                      {fuelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Pie Chart */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.9375rem', textAlign: 'center' }}>
                Payment Mode Share (INR)
              </div>
              <div className="w-full h-[15rem]">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index + 2]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    );
  };

  const renderReportsPanel = () => {
    const filteredSales = sales.filter(s => {
      const matchSearch = s.workerName.toLowerCase().includes(reportSearch.toLowerCase());
      const matchFuel = reportFilterFuel === 'All' || s.fuel === reportFilterFuel;
      return matchSearch && matchFuel;
    });

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="dashboard-panel active"
      >
        <div className="panel-card" style={{ borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid var(--border-gray)', boxShadow: 'var(--shadow-lg)' }}>
          <div className="flex-between mb-20">
            <div className="panel-title" style={{ marginBottom: 0 }}>Sales Audit Reports</div>
            <div style={{ display: 'flex', gap: '0.9375rem' }}>
              <input 
                type="text" 
                className="input-field filter-field" 
                style={{ width: '13.75rem', height: '2rem', marginBottom: 0, fontSize: '1rem', borderRadius: '0.625rem', border: '1px solid var(--border-gray)' }} 
                placeholder="Search Worker..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
              />
              <select 
                className="input-field filter-field" 
                style={{ width: '8.75rem', height: '2rem', marginBottom: 0, fontSize: '1rem', borderRadius: '0.625rem', border: '1px solid var(--border-gray)' }}
                value={reportFilterFuel}
                onChange={(e) => setReportFilterFuel(e.target.value)}
              >
                <option value="All">All Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--text-black)' }}>
                  <th style={{ padding: '0.625rem' }}>ID</th>
                  <th style={{ padding: '0.625rem' }}>Worker</th>
                  <th style={{ padding: '0.625rem' }}>Nozzle</th>
                  <th style={{ padding: '0.625rem' }}>Fuel</th>
                  <th style={{ padding: '0.625rem' }}>Quantity</th>
                  <th style={{ padding: '0.625rem' }}>Amount</th>
                  <th style={{ padding: '0.625rem' }}>Mode</th>
                  <th style={{ padding: '0.625rem' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-gray)' }}>No sales matching criteria.</td>
                  </tr>
                ) : (
                  filteredSales.slice().reverse().map((s) => {
                    const timeFormatted = new Date(s.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const dateFormatted = formatDate(s.date);
                    return (
                      <tr key={s.id || s._id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                        <td style={{ padding: '0.625rem', fontWeight: 700 }}>{(s.id || s._id).toString().slice(-6)}</td>
                        <td style={{ padding: '0.625rem' }}>{s.workerName}</td>
                        <td style={{ padding: '0.625rem', fontWeight: 700, color: 'var(--bp-blue)' }}>Nozzle {s.nozzle}</td>
                        <td style={{ padding: '0.625rem' }}>{s.fuel}</td>
                        <td style={{ padding: '0.625rem' }}>{s.liters.toFixed(1)} L</td>
                        <td style={{ padding: '0.625rem', fontWeight: 700, color: 'var(--status-orange)' }}>₹{s.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td style={{ padding: '0.625rem' }}>
                          <span 
                            style={{ 
                              background: s.payment === 'Cash' ? 'var(--status-orange)' : 'var(--status-green)', 
                              padding: '2px 0.5rem', 
                              borderRadius: '0.625rem', 
                              fontSize: '0.6875rem', 
                              fontWeight: 700, 
                              color: s.payment === 'Cash' ? 'var(--text-black)' : '#fff' 
                            }}
                          >
                            {s.payment}
                          </span>
                        </td>
                        <td style={{ padding: '0.625rem', fontSize: '0.75rem', color: 'var(--text-gray)' }}>{dateFormatted} {timeFormatted}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
          <div className="panel-title">System Settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Admin ID:</strong> <span style={{ color: 'var(--text-gray)' }}>{userSession?.id}</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Role Permission:</strong> <span style={{ color: 'var(--status-red-dark)', fontWeight: 700 }}>Super Administrator</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--border-gray)', paddingBottom: '0.9375rem' }}>
              <strong>Data Control:</strong>
              <div style={{ marginTop: '0.625rem', display: 'flex', gap: '0.9375rem' }}>
                <button 
                  onClick={handleResetDatabase}
                  className="btn-primary" 
                  style={{ width: '14.375rem', height: '2rem', fontSize: '1rem', borderRadius: '0.625rem', backgroundColor: 'var(--status-red-dark)', border: 'none', color: '#fff' }}
                >
                  Reset Database State
                </button>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <button 
                onClick={onLogout}
                className="btn-primary" 
                style={{ width: '12.5rem', height: '2.75rem', borderRadius: '0.75rem', fontSize: '1rem', backgroundColor: 'var(--bp-navy)', color: 'var(--bp-yellow)', border: 'none', textDecoration: 'none' }}
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
              {userSession?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'SA'}
            </div>
            Welcome <span style={{ fontWeight: 700, marginLeft: '0.625rem' }}>{userSession?.name}</span>

          </div>
          
          <button 
            onClick={handleExportCSV}
            className="btn-primary" 
            style={{ padding: '0 24px', height: '44px', backgroundColor: 'var(--bg-white)', color: 'var(--text-black)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-gray)' }}
          >
            Export CSV
          </button>
        </div>

        {/* Tab switcher wrapper */}
        <AnimatePresence mode="wait">
          <div key={activeTab}>
            {activeTab === 'dashboard' && renderDashboardPanel()}
            {activeTab === 'fuel' && renderFuelPanel()}
            {activeTab === 'nozzles' && renderNozzlesPanel()}
            {activeTab === 'workers' && renderWorkersPanel()}
            {activeTab === 'entries' && renderEntriesPanel()}
            {activeTab === 'shifts' && renderShiftsPanel()}
            {activeTab === 'expenses' && renderExpensesPanel()}
            {activeTab === 'generator' && renderGeneratorPanel()}
            {activeTab === 'sales-analysis' && renderSalesAnalysisPanel()}
            {activeTab === 'reports' && renderReportsPanel()}
            {activeTab === 'settings' && renderSettingsPanel()}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

import React from 'react';
import { CircularGauge } from '../../components/CircularGauge';
import { TrendingUp, FileText, Settings, BadgeIndianRupee, Activity, Play } from 'lucide-react';

const imgHand = "http://localhost:3845/assets/5eee25053cfd4acbade4f181c6909baec6a261cc.png";

export const Dashboard = ({ stocks, sales, workers, attendance, onTabChange }) => {
  // Compute totals
  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0) || 246800;
  
  const petrolStock = stocks.find(s => s.fuelType === 'Petrol') || { current: 8450, capacity: 12400 };
  const dieselStock = stocks.find(s => s.fuelType === 'Diesel') || { current: 12230, capacity: 19700 };

  const petrolPercent = (petrolStock.current / petrolStock.capacity) * 100;
  const dieselPercent = (dieselStock.current / dieselStock.capacity) * 100;

  const handleExportCSV = () => {
    // Generate simple CSV download
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Sale ID,Worker,Nozzle,Fuel,Liters,Amount,Payment,Date"]
      .concat(sales.map(s => `${s.id || s._id || 'N/A'},${s.workerName},${s.nozzle},${s.fuel},${s.liters},${s.amount},${s.payment},${s.date}`))
      .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bp_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-[2.8125rem] animate-fade-in font-mono select-none">
      {/* Welcome header & CSV Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6" data-node-id="10:13">
          <img 
            alt="Hand shaking greeting" 
            src={imgHand} 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-3xl font-bold font-normal text-bp-navy leading-none">
            Welcome Super Admin
          </h1>
        </div>

        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-white border border-border-gray hover:bg-gray-50 text-bp-navy font-bold text-base px-6 h-12 rounded-xl shadow-sm cursor-pointer transition-all"
        >
          <span>Export CSV</span>
          <svg className="w-[1.125rem] h-[1.125rem] text-bp-navy fill-current" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </button>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-3 gap-6" data-node-id="102:268">
        {/* Total Revenue */}
        <div className="bg-white border border-border-gray rounded-xl p-6 flex justify-between items-start shadow-elevation-4 relative overflow-hidden">
          <div className="space-y-[0.625rem]">
            <p className="text-base font-bold text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold font-bold text-bp-navy">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[0.875rem] font-bold text-status-green-dark">12% Increase vs yesterday</p>
          </div>
          <div className="text-status-green-dark p-[0.5rem] bg-green-50 rounded-xl">
            <TrendingUp className="w-[3rem] h-[3rem]" />
          </div>
        </div>

        {/* Petrol Stock */}
        <div className="bg-white border border-border-gray rounded-xl p-6 flex justify-between items-start shadow-elevation-4">
          <div className="space-y-[0.625rem]">
            <p className="text-base font-bold text-gray-500">Petrol Stock</p>
            <p className="text-3xl font-bold font-bold text-bp-navy">{petrolStock.current.toLocaleString()} L</p>
            <p className="text-[0.875rem] font-bold text-status-red">{Math.round(petrolPercent)}% capacity</p>
          </div>
          <CircularGauge percentage={petrolPercent} color="#f54800" />
        </div>

        {/* Diesel Stock */}
        <div className="bg-white border border-border-gray rounded-xl p-6 flex justify-between items-start shadow-elevation-4">
          <div className="space-y-[0.625rem]">
            <p className="text-base font-bold text-gray-500">Diesel Stock</p>
            <p className="text-3xl font-bold font-bold text-bp-navy">{dieselStock.current.toLocaleString()} L</p>
            <p className="text-[0.875rem] font-bold text-status-red">{Math.round(dieselPercent)}% capacity</p>
          </div>
          <CircularGauge percentage={dieselPercent} color="#165dfc" />
        </div>
      </div>

      {/* Main dashboard body splits */}
      <div className="grid grid-cols-2 gap-6 items-stretch">
        {/* Current Shift Status card */}
        <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-elevation-4 flex flex-col justify-between" data-node-id="135:324">
          <h3 className="text-xl font-bold font-bold text-bp-navy mb-[1.5625rem]">Current Shift Status</h3>
          <div className="space-y-[1.25rem] flex-grow flex flex-col justify-around">
            <div className="bg-white border border-gray-100 rounded-xl p-6 flex justify-between items-center shadow-elevation-2">
              <div>
                <p className="text-base font-bold text-bp-navy">Morning Shift</p>
                <p className="text-[0.875rem] font-bold text-gray-500">6:00 AM - 12:00 PM</p>
              </div>
              <div className="bg-status-green text-bp-navy font-bold text-base px-6 py-[0.375rem] rounded-xl shadow-sm">
                Active
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 text-center shadow-elevation-2 flex items-center justify-between">
              <span className="text-base font-bold text-gray-600">Total workers</span>
              <span className="text-xl font-bold font-bold text-bp-navy">{workers.length || 15}</span>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl py-4 px-6 text-center shadow-elevation-2 flex items-center justify-between">
              <span className="text-base font-bold text-gray-600">Currently Onboard</span>
              <span className="text-xl font-bold font-bold text-bp-navy">{attendance.filter(a => a.status === 'Active').length || 8}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions layout */}
        <div className="bg-white border border-border-gray rounded-2xl p-6 shadow-elevation-up" data-node-id="135:329">
          <h3 className="text-xl font-bold font-bold text-bp-navy mb-[1.875rem]">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Daily Entry */}
            <div 
              onClick={() => onTabChange('entries')}
              className="bg-white border border-gray-100 rounded-xl p-6 h-16 flex items-center gap-6 shadow-elevation-3 cursor-pointer hover:bg-gray-50 hover:scale-[1.02] transition-all"
            >
              <div className="p-2 bg-blue-50 text-bp-blue rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-bp-navy">Daily Entry</span>
            </div>

            {/* Check Stock */}
            <div 
              onClick={() => onTabChange('fuel')}
              className="bg-white border border-gray-100 rounded-xl p-6 h-16 flex items-center gap-6 shadow-elevation-3 cursor-pointer hover:bg-gray-50 hover:scale-[1.02] transition-all"
            >
              <div className="p-2 bg-orange-50 text-status-orange rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-bp-navy">Check Stock</span>
            </div>

            {/* Attendance */}
            <div 
              onClick={() => onTabChange('worker')}
              className="bg-white border border-gray-100 rounded-xl p-6 h-16 flex items-center gap-6 shadow-elevation-3 cursor-pointer hover:bg-gray-50 hover:scale-[1.02] transition-all"
            >
              <div className="p-2 bg-green-50 text-status-green-dark rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-bp-navy">Attendance</span>
            </div>

            {/* Reports */}
            <div 
              onClick={() => onTabChange('reports')}
              className="bg-white border border-gray-100 rounded-xl p-6 h-16 flex items-center gap-6 shadow-elevation-3 cursor-pointer hover:bg-gray-50 hover:scale-[1.02] transition-all"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-bp-navy">Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;

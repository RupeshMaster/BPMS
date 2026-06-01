import React, { useState } from 'react';
import StockTrendChart from '../../components/StockTrendChart';
import api from '../../utils/api';
import { Search, RefreshCw, Plus, Filter } from 'lucide-react';

export const FuelTab = ({ stocks, sales, fetchAllData }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refillData, setRefillData] = useState({ fuelType: 'Petrol', liters: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute Metrics
  const petrolStock = stocks.find(s => s.fuelType === 'Petrol') || { current: 8450, capacity: 12400 };
  const dieselStock = stocks.find(s => s.fuelType === 'Diesel') || { current: 16430, capacity: 19700 };

  const petrolPercent = (petrolStock.current / petrolStock.capacity) * 100;
  const dieselPercent = (dieselStock.current / dieselStock.capacity) * 100;

  // Calculate today's sales liters
  const todayLiters = sales
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.liters, 0) || 2270;

  const handleRefillChange = (e) => {
    setRefillData({ ...refillData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRefillSubmit = async (e) => {
    e.preventDefault();
    if (!refillData.liters || Number(refillData.liters) <= 0) {
      setError('Please enter a valid volume in liters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/fuel/refill', refillData);
      setRefillData({ fuelType: 'Petrol', liters: '' });
      setIsModalOpen(false);
      fetchAllData(); // Refresh metrics
    } catch (err) {
      setError(err.response?.data?.message || 'Refill transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  // Mock static Tank entries representing Figma table rows
  const tankDetails = [
    { id: 'P1', fuel: 'Petrol', opening: '9,200 L', refill: '—', sold: '200 L', current: `${petrolStock.current.toLocaleString()} L`, capacity: `${petrolStock.capacity.toLocaleString()} L`, status: 'Normal', lastRefill: '18/5/26' },
    { id: 'D1', fuel: 'Diesel', opening: '13,000 L', refill: '1,000 L', sold: '1,770 L', current: `${dieselStock.current.toLocaleString()} L`, capacity: `${dieselStock.capacity.toLocaleString()} L`, status: 'Normal', lastRefill: '20/5/26' }
  ];

  const filteredTanks = tankDetails.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) || 
    t.fuel.toLowerCase().includes(search.toLowerCase()) ||
    t.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-[2.8125rem] animate-fade-in font-mono select-none">
      {/* Tab Header & Action Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-normal text-bp-navy leading-none">
          Fuel Management
        </h1>

        <div className="flex gap-6">
          {/* Refresh Action */}
          <button 
            onClick={fetchAllData}
            className="flex items-center justify-center gap-[0.625rem] bg-white border border-border-gray hover:bg-gray-50 text-bp-navy font-bold text-base px-6 h-12 rounded-xl shadow-elevation-2 cursor-pointer transition-all"
          >
            <RefreshCw className="w-[1.125rem] h-[1.125rem]" />
            <span>Refresh</span>
          </button>

          {/* Add Refill Action */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-[0.625rem] bg-[#f54800] hover:opacity-90 active:scale-95 text-white font-bold text-base px-6 h-12 rounded-xl shadow-elevation-2 cursor-pointer transition-all"
          >
            <Plus className="w-[1.125rem] h-[1.125rem]" />
            <span>Add Refill Entry</span>
          </button>
        </div>
      </div>

      {/* Fuel metrics grid cards */}
      <div className="grid grid-cols-3 gap-6" data-node-id="158:240">
        {/* Total Petrol Stock */}
        <div className="bg-[#f54800] border border-[#ff7b08] rounded-xl p-6 text-white flex flex-col justify-between shadow-elevation-2 h-32" data-node-id="158:255">
          <p className="text-xl font-bold font-bold">Total Petrol Stock</p>
          <p className="text-3xl font-bold font-bold">{petrolStock.current.toLocaleString()} L</p>
          <div className="flex justify-between items-center text-[0.9375rem] font-bold">
            <span>{Math.round(petrolPercent)}% Capacity</span>
            <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center bg-white/10 font-bold">P</div>
          </div>
        </div>

        {/* Total Diesel Stock */}
        <div className="bg-[#165dfc] border border-[#0842ff] rounded-xl p-6 text-white flex flex-col justify-between shadow-elevation-2 h-32" data-node-id="158:269">
          <p className="text-xl font-bold font-bold">Total Diesel Stock</p>
          <p className="text-3xl font-bold font-bold">{dieselStock.current.toLocaleString()} L</p>
          <div className="flex justify-between items-center text-[0.9375rem] font-bold">
            <span>{Math.round(dieselPercent)}% Capacity</span>
            <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center bg-white/10 font-bold">D</div>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-[#03750c] border border-[#03750c] rounded-xl p-6 text-white flex flex-col justify-between shadow-elevation-2 h-32" data-node-id="158:242">
          <p className="text-xl font-bold font-bold">Today's Sales</p>
          <p className="text-3xl font-bold font-bold">{todayLiters.toLocaleString()} L</p>
          <div className="flex justify-between items-center text-[0.9375rem] font-bold">
            <span>+ 8.5% vs yesterday</span>
            <div className="w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center bg-white/10 font-bold">₹</div>
          </div>
        </div>
      </div>

      {/* Stock trends graph */}
      <div className="bg-white border border-border-gray rounded-xl p-6 shadow-elevation-2 relative" data-node-id="155:424">
        <div className="flex justify-between items-center mb-[1.5625rem]">
          <h3 className="text-xl font-bold font-bold text-bp-navy">Stock Trends</h3>
          <button className="flex items-center gap-[0.5rem] bg-white border border-border-gray px-[0.9375rem] py-[0.5rem] rounded-[0.9375rem] text-[1rem] text-bp-navy font-bold cursor-pointer">
            <Filter className="w-[1rem] h-[1rem]" />
            <span>Filter</span>
          </button>
        </div>
        <StockTrendChart />
      </div>

      {/* Tank details table */}
      <div className="bg-white border border-border-gray rounded-xl p-6 shadow-elevation-2 space-y-[1.25rem]" data-node-id="155:466">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-bold text-bp-navy">Tank Wise Stock Detail</h3>
          {/* Table search bar */}
          <div className="relative w-[18.75rem]">
            <input 
              type="text" 
              placeholder="Search tanks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#ededed] border-none rounded-[0.625rem] pl-[2.5rem] pr-[0.9375rem] py-[0.625rem] text-[1rem] focus:outline-none focus:ring-1 focus:ring-bp-blue"
            />
            <Search className="absolute left-[0.75rem] top-[0.75rem] w-[1.125rem] h-[1.125rem] text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[0.9375rem] border border-border-gray">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#d9d9d9] text-bp-navy font-bold text-base">
                <th className="p-6">Tank</th>
                <th className="p-6">Fuel Type</th>
                <th className="p-6">Opening</th>
                <th className="p-6">Refill</th>
                <th className="p-6">Sold</th>
                <th className="p-6">Current</th>
                <th className="p-6">Capacity</th>
                <th className="p-6">Status</th>
                <th className="p-6">Last Refill</th>
              </tr>
            </thead>
            <tbody>
              {filteredTanks.map((tank) => (
                <tr key={tank.id} className="border-b border-border-gray hover:bg-gray-50 text-[1rem]">
                  <td className="p-6 font-bold">{tank.id}</td>
                  <td className="p-6 font-bold">{tank.fuel}</td>
                  <td className="p-6 text-gray-600">{tank.opening}</td>
                  <td className={`p-6 font-bold ${tank.refill !== '—' ? 'text-status-green-dark' : 'text-gray-500'}`}>{tank.refill}</td>
                  <td className="p-6 text-gray-600">{tank.sold}</td>
                  <td className="p-6 font-bold text-bp-navy">{tank.current}</td>
                  <td className="p-6 text-gray-600">{tank.capacity}</td>
                  <td className="p-6">
                    <span className="text-status-green-dark font-bold bg-green-50 px-[0.625rem] py-[0.25rem] rounded-lg text-[0.875rem]">
                      {tank.status}
                    </span>
                  </td>
                  <td className="p-6 text-gray-600">{tank.lastRefill}</td>
                </tr>
              ))}
              {filteredTanks.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400">No matching tank entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refill Dialog Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-border-gray w-[24rem] p-6 rounded-2xl shadow-elevation-4 relative">
            <h3 className="text-xl font-bold font-bold text-bp-navy mb-[1.25rem]">Add Refill Entry</h3>

            {error && (
              <div className="bg-red-100 text-red-700 rounded-[0.625rem] p-[0.625rem] text-[0.875rem] font-bold mb-[0.9375rem] text-center border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleRefillSubmit} className="space-y-[1.25rem]">
              <div className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold text-bp-navy/80">Fuel Type</label>
                <select 
                  name="fuelType"
                  value={refillData.fuelType}
                  onChange={handleRefillChange}
                  className="h-12 bg-[#ededed] border-none rounded-[0.9375rem] px-[1.25rem] text-base focus:ring-2 focus:ring-bp-blue"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold text-bp-navy/80">Volume (Liters)</label>
                <input 
                  type="number" 
                  name="liters"
                  value={refillData.liters}
                  onChange={handleRefillChange}
                  placeholder="Enter Liters"
                  className="h-12 bg-[#ededed] border-none rounded-[0.9375rem] px-[1.25rem] text-base focus:ring-2 focus:ring-bp-blue"
                />
              </div>

              <div className="flex gap-6 pt-[0.625rem]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-bp-navy font-bold rounded-[0.9375rem] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-bp-blue hover:opacity-90 text-bp-yellow font-bold rounded-[0.9375rem] cursor-pointer flex items-center justify-center"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FuelTab;

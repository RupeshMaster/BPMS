import React, { useState } from 'react';
import api from '../../utils/api';
import { Play, Plus, Sliders, AlertTriangle } from 'lucide-react';

export const NozzleTab = ({ nozzles, fetchAllData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', fuel: 'Petrol', reading: '', lastMaintenance: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCount = nozzles.filter(n => n.status === 'Active').length || 4;
  const offlineCount = nozzles.filter(n => n.status !== 'Active').length || 2;
  const avgAccuracy = nozzles.length > 0 
    ? (nozzles.reduce((sum, n) => sum + n.accuracyRate, 0) / nozzles.length).toFixed(1)
    : '90.3';

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id) {
      setError('Please provide a unique Nozzle ID.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/nozzles', formData);
      setFormData({ id: '', fuel: 'Petrol', reading: '', lastMaintenance: '' });
      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering nozzle.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalibrate = async (nozzleId) => {
    try {
      await api.post(`/nozzles/${nozzleId}/calibrate`);
      fetchAllData();
    } catch (err) {
      alert('Calibration failed.');
    }
  };

  const handleCalibrateAll = async () => {
    try {
      // Loop calibrate all active nozzles
      const activeNozzles = nozzles.filter(n => n.status === 'Active');
      await Promise.all(activeNozzles.map(n => api.post(`/nozzles/${n.id}/calibrate`)));
      fetchAllData();
    } catch (err) {
      alert('Error calibrating nozzles.');
    }
  };

  return (
    <div className="space-y-[2.8125rem] animate-fade-in font-mono select-none">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-normal text-bp-navy leading-none">
          Nozzle Management
        </h1>

        <div className="flex gap-6">
          {/* Calibrate All Action */}
          <button 
            onClick={handleCalibrateAll}
            className="flex items-center justify-center gap-[0.625rem] bg-white border border-border-gray hover:bg-gray-50 text-bp-navy font-bold text-base px-6 h-12 rounded-xl shadow-elevation-2 cursor-pointer transition-all"
          >
            <Sliders className="w-[1.125rem] h-[1.125rem]" />
            <span>Calibrate All</span>
          </button>

          {/* Add Nozzle Action */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-[0.625rem] bg-[#f54800] hover:opacity-90 active:scale-95 text-white font-bold text-base px-6 h-12 rounded-xl shadow-elevation-2 cursor-pointer transition-all"
          >
            <Plus className="w-[1.125rem] h-[1.125rem]" />
            <span>Add Nozzle</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-6" data-node-id="175:596">
        {/* Active Nozzles */}
        <div className="bg-[#03750c] border border-[#03750c] rounded-xl p-6 text-white flex flex-col justify-between shadow-elevation-2 h-32" data-node-id="175:603">
          <p className="text-xl font-bold font-bold">Active Nozzles</p>
          <p className="text-3xl font-bold font-bold">{activeCount}</p>
          <p className="text-[0.9375rem] font-bold">Currently Dispensing</p>
        </div>

        {/* Offline Nozzles */}
        <div className="bg-[#f54800] border border-[#f54800] rounded-xl p-6 text-white flex flex-col justify-between shadow-elevation-2 h-32" data-node-id="175:616">
          <p className="text-xl font-bold font-bold">Offline Nozzles</p>
          <p className="text-3xl font-bold font-bold">{offlineCount}</p>
          <p className="text-[0.9375rem] font-bold">Maintenance required</p>
        </div>

        {/* Avg Accuracy */}
        <div className="bg-[#165dfc] border border-[#165dfc] rounded-xl p-6 text-white flex flex-col justify-between shadow-elevation-2 h-32" data-node-id="175:598">
          <p className="text-xl font-bold font-bold">Avg Accuracy</p>
          <p className="text-3xl font-bold font-bold">{avgAccuracy}%</p>
          <p className="text-[0.9375rem] font-bold">All active nozzles</p>
        </div>
      </div>

      {/* Grid of nozzles */}
      <div className="grid grid-cols-3 gap-[2.1875rem]">
        {nozzles.map((nozzle) => {
          const dispensed = Number((nozzle.reading - nozzle.openingReading).toFixed(1));
          const isOffline = nozzle.status !== 'Active';

          return (
            <div 
              key={nozzle.id}
              className={`border-4 rounded-xl p-6 flex flex-col justify-between shadow-elevation-2 h-[33.125rem] relative transition-all duration-300 ${
                isOffline 
                  ? 'bg-[#fff8ef] border-[#ff6800]' 
                  : 'bg-[#f1fdf4] border-[#00c851]'
              }`}
              data-node-id="195:881"
            >
              {/* Header inside card */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl font-bold text-bp-navy">Nozzle - {nozzle.id}</h3>
                  <span className="text-gray-400 font-bold text-[1rem]">{nozzle.fuel}</span>
                </div>

                <span 
                  className={`font-bold text-[0.75rem] px-[0.9375rem] py-[0.25rem] rounded-full text-white shadow-sm ${
                    isOffline ? 'bg-[#ff6800]' : 'bg-[#00c851]'
                  }`}
                >
                  {nozzle.status}
                </span>
              </div>

              {/* Body elements inside card */}
              <div className="space-y-[0.75rem] py-[1.25rem]">
                <div className="flex justify-between text-[0.9375rem]">
                  <span className="text-gray-400 font-bold">Worker</span>
                  <span className="text-bp-navy font-bold">{nozzle.assignedWorker || 'None'}</span>
                </div>
                <div className="flex justify-between text-[0.9375rem]">
                  <span className="text-gray-400 font-bold">Shift</span>
                  <span className="text-bp-navy font-bold">{nozzle.assignedWorkerId ? 'Active Shift' : 'None'}</span>
                </div>

                <div className="border-t border-dashed border-gray-300 my-2"></div>

                <div className="flex justify-between text-[0.9375rem]">
                  <span className="text-gray-400 font-bold">Opening</span>
                  <span className="text-bp-navy font-bold">{(nozzle.openingReading || 0).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between text-[0.9375rem]">
                  <span className="text-gray-400 font-bold">Current</span>
                  <span className="text-bp-navy font-bold">{(nozzle.reading || 0).toLocaleString()} L</span>
                </div>
                <div className="flex justify-between text-[0.9375rem]">
                  <span className="text-gray-400 font-bold">Dispensed</span>
                  <span className="text-status-green-dark font-bold">{dispensed.toLocaleString()} L</span>
                </div>
              </div>

              {/* Footer status / actions */}
              <div className="space-y-[0.9375rem]">
                {/* Accuracy progress bar */}
                {!isOffline && (
                  <div className="border border-black bg-white rounded-[0.3125rem] p-[0.625rem] space-y-[0.375rem]">
                    <div className="flex justify-between items-center text-[0.6875rem] font-bold">
                      <span className="text-bp-navy">Accuracy Rate</span>
                      <span className="text-status-green-dark">{nozzle.accuracyRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-[0.625rem] rounded-full overflow-hidden">
                      <div 
                        className="bg-status-green-dark h-full rounded-full transition-all duration-500" 
                        style={{ width: `${nozzle.accuracyRate}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] text-gray-400 font-bold">
                    Last maintenance: {nozzle.lastMaintenance || '15 Feb 2026'}
                  </span>
                  
                  {!isOffline && (
                    <button 
                      onClick={() => handleCalibrate(nozzle.id)}
                      className="bg-bp-blue hover:opacity-95 text-bp-yellow font-bold text-[0.75rem] px-[0.75rem] py-[0.375rem] rounded-[0.625rem] cursor-pointer"
                    >
                      Calibrate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Nozzle Dialog Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-border-gray w-[24rem] p-6 rounded-2xl shadow-elevation-4 relative">
            <h3 className="text-xl font-bold font-bold text-bp-navy mb-[1.25rem]">Add Nozzle</h3>

            {error && (
              <div className="bg-red-100 text-red-700 rounded-[0.625rem] p-[0.625rem] text-[0.875rem] font-bold mb-[0.9375rem] text-center border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-[1.25rem]">
              <div className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold text-bp-navy/80">Nozzle Identifier ID</label>
                <input 
                  type="text" 
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="e.g. C, D, 4"
                  className="h-12 bg-[#ededed] border-none rounded-[0.9375rem] px-[1.25rem] text-base focus:ring-2 focus:ring-bp-blue"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold text-bp-navy/80">Fuel Type</label>
                <select 
                  name="fuel"
                  value={formData.fuel}
                  onChange={handleInputChange}
                  className="h-12 bg-[#ededed] border-none rounded-[0.9375rem] px-[1.25rem] text-base focus:ring-2 focus:ring-bp-blue"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[0.875rem] font-bold text-bp-navy/80">Starting Reading (Liters)</label>
                <input 
                  type="number" 
                  name="reading"
                  value={formData.reading}
                  onChange={handleInputChange}
                  placeholder="e.g. 50000"
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
                  {loading ? 'Adding...' : 'Add Nozzle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default NozzleTab;

/* eslint-disable no-unused-vars, no-undef */
import React, { useState } from 'react';
import api from '../../utils/api';
import { Search, Plus, Trash2, Edit2, Filter } from 'lucide-react';

const imgCalendar = "http://localhost:3845/assets/6abae4b7d405f34b59976a1e0905ec6f123474a1.png";
const imgPulse = "http://localhost:3845/assets/a58d7460e8d13717b4985b81025f313850694787.png";

export const WorkerTab = ({ workers, attendance, fetchAllData }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', phone: '', role: 'Operator', fuel: 'Petrol', shift: 'Morning', nozzle: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute metrics
  const totalWorkforce = workers.length || 15;
  const activeCount = attendance.filter(a => a.status === 'Active').length || 12;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.phone) {
      setError('ID, Name, and Phone are required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/workers', formData);
      setFormData({ id: '', name: '', phone: '', role: 'Operator', fuel: 'Petrol', shift: 'Morning', nozzle: '', password: '' });
      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId) => {
    if (!window.confirm(`Are you sure you want to delete worker ${workerId}?`)) return;
    try {
      await api.delete(`/workers/${workerId}`);
      fetchAllData();
    } catch (err) {
      alert('Error deleting worker.');
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Employee ID,Name,Role,Fuel Assignment,Shift,Contact,Status,Attendance"]
      .concat(workers.map(w => `${w.id},${w.name},${w.role || 'Operator'},${w.nozzle ? 'Nozzle ' + w.nozzle : 'Petrol'},${w.shift || 'Morning'},${w.phone},Active,98%`))
      .join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bp_workforce_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Seed default workers mapping to UI if backend database doesn't have it yet
  const defaultWorkersList = [
    { id: 'BP001', name: 'Rajesh Kumar', role: 'Senior Operator', fuel: 'Petrol', shift: 'Morning', phone: '1347541405', status: 'Active', attendanceRate: '98%' },
    { id: 'BP002', name: 'Priya Sharma', role: 'Operator', fuel: 'Diesel', shift: 'Afternoon', phone: '2036987450', status: 'Active', attendanceRate: '80%' },
    { id: 'BP003', name: 'Amit Patel', role: 'Operator', fuel: 'Petrol', shift: 'Evening', phone: '9854120369', status: 'Active', attendanceRate: '70%' },
    { id: 'BP004', name: 'Sunita Das', role: 'Operator', fuel: 'Diesel', shift: 'Morning', phone: '8874502136', status: 'Active', attendanceRate: '69%' }
  ];

  const displayList = workers.length > 0 
    ? workers.map(w => ({
        id: w.id,
        name: w.name,
        role: w.role || 'Operator',
        fuel: w.nozzle ? (w.nozzle === 'A' ? 'Petrol' : 'Diesel') : 'Petrol',
        shift: w.shift || 'Morning',
        phone: w.phone,
        status: 'Active',
        attendanceRate: '98%'
      }))
    : defaultWorkersList;

  const filteredWorkers = displayList.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.id.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-[2.8125rem] animate-fade-in font-mono select-none">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-normal text-bp-navy leading-none">
          Worker Management
        </h1>

        <div className="flex gap-6">
          {/* Export CSV Action */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-white border border-border-gray hover:bg-gray-50 text-bp-navy font-bold text-base px-6 h-12 rounded-xl shadow-sm cursor-pointer transition-all"
          >
            <span>Export CSV</span>
          </button>

          {/* Add Worker Action */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#f54800] hover:opacity-90 active:scale-95 text-white font-bold text-base px-6 h-12 rounded-xl shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6" data-node-id="199:771">
        {/* Total Workforce */}
        <div className="bg-white border border-border-gray rounded-xl p-6 flex justify-between items-start shadow-elevation-2 h-32" data-node-id="175:768">
          <div className="space-y-[0.625rem]">
            <p className="text-xl font-bold font-bold text-gray-500">Total Workforce</p>
            <p className="text-3xl font-bold font-bold text-bp-navy">{totalWorkforce}</p>
            <p className="text-base font-bold text-status-green-dark">+2 VS last Year</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-status-green-dark flex items-center justify-center rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Shift */}
        <div className="bg-white border border-border-gray rounded-xl p-6 flex justify-between items-start shadow-elevation-2 h-32" data-node-id="175:774">
          <div className="space-y-[0.625rem]">
            <p className="text-xl font-bold font-bold text-gray-500">Active Shift</p>
            <p className="text-3xl font-bold font-bold text-bp-navy">{activeCount}</p>
            <div className="text-[0.875rem] font-bold text-status-red">
              <p className="m-0">3 on leave</p>
              <p className="text-[0.6875rem] text-gray-400 font-normal">(2 planned, 1 sick)</p>
            </div>
          </div>
          <img src={imgCalendar} alt="calendar" className="w-12 h-12 object-contain" />
        </div>

        {/* Avg Attendance */}
        <div className="bg-white border border-border-gray rounded-xl p-6 flex justify-between items-start shadow-elevation-2 h-32" data-node-id="175:761">
          <div className="space-y-[0.625rem]">
            <p className="text-xl font-bold font-bold text-gray-500">Avg Attendance</p>
            <p className="text-3xl font-bold font-bold text-bp-navy">93.6%</p>
            <p className="text-base font-bold text-status-green-dark">+ 0.5% vs yesterday</p>
          </div>
          <img src={imgPulse} alt="pulse" className="w-12 h-12 object-contain" />
        </div>
      </div>

      {/* Directory Card */}
      <div className="bg-white border border-border-gray rounded-xl p-6 shadow-elevation-3 space-y-[1.5625rem]" data-node-id="236:764">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-bold text-bp-navy">Work Directory</h3>
          
          <div className="flex gap-6">
            {/* Search */}
            <div className="relative w-48">
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#ededed] border-none rounded-[0.625rem] pl-[2.5rem] pr-[0.9375rem] py-[0.625rem] text-[1rem] focus:ring-1 focus:ring-bp-blue focus:outline-none"
              />
              <Search className="absolute left-[0.75rem] top-[0.75rem] w-[1.125rem] h-[1.125rem] text-gray-400" />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-[0.5rem] bg-white border border-border-gray px-[0.9375rem] py-[0.5rem] rounded-[0.9375rem] text-[1rem] text-bp-navy font-bold cursor-pointer">
              <Filter className="w-[1rem] h-[1rem]" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto rounded-[0.9375rem] border border-border-gray">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#d9d9d9] text-bp-navy font-bold text-base">
                <th className="p-6">ID</th>
                <th className="p-6">Employee</th>
                <th className="p-6">Role</th>
                <th className="p-6">Fuel</th>
                <th className="p-6">Shift</th>
                <th className="p-6">Contact</th>
                <th className="p-6">Status</th>
                <th className="p-6">Attendance</th>
                <th className="p-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="border-b border-border-gray hover:bg-gray-50 text-[1rem] font-mono">
                  <td className="p-6">{worker.id}</td>
                  <td className="p-6 font-bold">{worker.name}</td>
                  <td className="p-6 text-gray-600">{worker.role}</td>
                  <td className="p-6 text-gray-600">{worker.fuel}</td>
                  <td className="p-6 text-gray-600">{worker.shift}</td>
                  <td className="p-6 text-gray-600">{worker.phone}</td>
                  <td className="p-6">
                    <span className="text-[#00c851] font-bold text-[1rem]">{worker.status}</span>
                  </td>
                  <td className="p-6 font-bold text-bp-navy text-center">{worker.attendanceRate}</td>
                  <td className="p-6 flex items-center justify-center gap-6">
                    <button 
                      onClick={() => handleDelete(worker.id)}
                      className="p-[0.5rem] bg-red-50 hover:bg-red-100 text-[#ff0202] rounded-lg cursor-pointer transition-colors shadow-sm"
                      title="Delete Worker"
                    >
                      <Trash2 className="w-[1.125rem] h-[1.125rem]" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400">No matching employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Dialog Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-border-gray w-[24rem] p-6 rounded-2xl shadow-elevation-4 relative">
            <h3 className="text-xl font-bold font-bold text-bp-navy mb-[1.25rem]">Add Worker</h3>

            {error && (
              <div className="bg-red-100 text-red-700 rounded-[0.625rem] p-[0.625rem] text-[0.875rem] font-bold mb-[0.9375rem] text-center border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-[0.9375rem]">
              <div className="flex flex-col gap-1">
                <label className="text-[0.8125rem] font-bold text-bp-navy/80">Worker ID / Employee Code</label>
                <input 
                  type="text" 
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="e.g. BP005"
                  className="h-10 bg-[#ededed] border-none rounded-[0.625rem] px-[0.9375rem] text-[1rem] focus:ring-1 focus:ring-bp-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.8125rem] font-bold text-bp-navy/80">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Name"
                  className="h-10 bg-[#ededed] border-none rounded-[0.625rem] px-[0.9375rem] text-[1rem] focus:ring-1 focus:ring-bp-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.8125rem] font-bold text-bp-navy/80">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter Contact"
                  className="h-10 bg-[#ededed] border-none rounded-[0.625rem] px-[0.9375rem] text-[1rem] focus:ring-1 focus:ring-bp-blue"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.8125rem] font-bold text-bp-navy/80">Role</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="h-10 bg-[#ededed] border-none rounded-[0.625rem] px-[0.9375rem] text-[1rem] focus:ring-1 focus:ring-bp-blue"
                >
                  <option value="Operator">Operator</option>
                  <option value="Senior Operator">Senior Operator</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.8125rem] font-bold text-bp-navy/80">Assign Nozzle</label>
                <input 
                  type="text" 
                  name="nozzle"
                  value={formData.nozzle}
                  onChange={handleInputChange}
                  placeholder="e.g. A, B"
                  className="h-10 bg-[#ededed] border-none rounded-[0.625rem] px-[0.9375rem] text-[1rem] focus:ring-1 focus:ring-bp-blue"
                />
              </div>

              <div className="flex gap-6 pt-[0.9375rem]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 text-bp-navy font-bold rounded-[0.625rem] cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-bp-blue hover:opacity-90 text-bp-yellow font-bold rounded-[0.625rem] cursor-pointer flex items-center justify-center"
                >
                  {loading ? 'Adding...' : 'Add Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default WorkerTab;

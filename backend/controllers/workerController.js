import { DbWrapper } from '../models/dbWrapper.js';

export const getWorkers = async (req, res) => {
  try {
    const users = await DbWrapper.getUsers();
    const workers = users.filter(u => u.role === 'worker');
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving workers.', error: err.message });
  }
};

export const createWorker = async (req, res) => {
  const { id, name, phone, dob, address, nozzle, password } = req.body;
  try {
    const existing = await DbWrapper.getUserById(id);
    if (existing) return res.status(400).json({ message: 'Worker ID already exists.' });

    const newWorker = {
      id,
      name,
      phone,
      password: password || id, // Default password is the employee ID
      role: 'worker',
      dob: dob || '',
      address: address || '',
      nozzle: nozzle || '',
      aadhar: 'aadhar_uploaded.pdf',
      pan: 'pan_uploaded.pdf',
      image: 'photo_uploaded.jpg'
    };

    const created = await DbWrapper.createUser(newWorker);

    // Sync nozzle assignment if provided
    if (nozzle) {
      await DbWrapper.updateNozzle(nozzle, { assignedWorker: name, assignedWorkerId: id });
    }

    res.status(201).json({ message: 'Worker created successfully!', worker: created });
  } catch (err) {
    res.status(500).json({ message: 'Error creating worker.', error: err.message });
  }
};

export const updateWorker = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const worker = await DbWrapper.updateUser(id, updateData);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });

    // Sync nozzle assignment if modified
    if (updateData.nozzle !== undefined) {
      // Clear old nozzle
      const nozzles = await DbWrapper.getNozzles();
      const oldNz = nozzles.find(n => n.assignedWorkerId === id);
      if (oldNz) {
        await DbWrapper.updateNozzle(oldNz.id, { assignedWorker: 'None', assignedWorkerId: '' });
      }
      // Set new nozzle
      if (updateData.nozzle) {
        await DbWrapper.updateNozzle(updateData.nozzle, { assignedWorker: worker.name, assignedWorkerId: id });
      }
    }

    res.json({ message: 'Worker details updated successfully!', worker });
  } catch (err) {
    res.status(500).json({ message: 'Error updating worker details.', error: err.message });
  }
};

export const deleteWorker = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await DbWrapper.deleteUser(id);
    if (!deleted) return res.status(404).json({ message: 'Worker not found.' });

    // Free any nozzle assigned to this worker
    const nozzles = await DbWrapper.getNozzles();
    const oldNz = nozzles.find(n => n.assignedWorkerId === id);
    if (oldNz) {
      await DbWrapper.updateNozzle(oldNz.id, { assignedWorker: 'None', assignedWorkerId: '' });
    }

    res.json({ message: 'Worker deleted successfully!', worker: deleted });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting worker.', error: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const list = await DbWrapper.getAttendance();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving attendance logs.', error: err.message });
  }
};

export const checkIn = async (req, res) => {
  const { workerId, workerName, deviceDate, deviceTime, openingReading } = req.body;
  const today = deviceDate || new Date().toISOString().split('T')[0];
  const timeString = deviceTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  try {
    const log = {
      workerId,
      workerName,
      date: today,
      checkIn: timeString,
      checkOut: '',
      openingReading: openingReading || 0,
      status: 'Active'
    };

    const updated = await DbWrapper.logAttendance(log);
    res.json({ message: 'Check-in logged successfully!', log: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error logging check-in.', error: err.message });
  }
};

export const checkOut = async (req, res) => {
  const { workerId, deviceTime, closingReading } = req.body;
  const timeString = deviceTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  try {
    const attendanceLogs = await DbWrapper.getAttendance();
    // Find ANY active check-in for this worker, even from a past date
    const activeLog = attendanceLogs.find(a => a.workerId === workerId && a.status === 'Active');
    if (!activeLog) {
      return res.status(404).json({ message: 'No active check-in found.' });
    }

    const baseLog = activeLog.toObject ? activeLog.toObject() : activeLog;
    const log = {
      ...baseLog,
      checkOut: timeString,
      closingReading: closingReading || 0,
      status: 'Inactive' // Marked off-duty
    };

    const updated = await DbWrapper.logAttendance(log);
    res.json({ message: 'Check-out logged successfully!', log: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error logging check-out.', error: err.message });
  }
};

export const toggleWorker = async (req, res) => {
  const { workerId } = req.body;
  try {
    const worker = await DbWrapper.getUserById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found.' });

    const newStatus = worker.status === 'Active' ? 'Inactive' : 'Active';
    const updated = await DbWrapper.updateUser(workerId, { status: newStatus });
    res.json({ message: 'Worker status toggled!', worker: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling worker.', error: err.message });
  }
};

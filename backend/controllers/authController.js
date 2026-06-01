import { DbWrapper } from '../models/dbWrapper.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bharat_secret_key';

export const login = async (req, res) => {
  const { id, password } = req.body;
  try {
    const user = await DbWrapper.getUserById(id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User ID not found.' });
    }

    // Direct password match for quick testing and local environment
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        nozzle: user.nozzle || '',
        dob: user.dob || '',
        address: user.address || ''
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
};

export const register = async (req, res) => {
  const { id, name, phone, dob, address, password } = req.body;
  try {
    const existingUser = await DbWrapper.getUserById(id);
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already exists.' });
    }

    const newUser = {
      id,
      password: password || id, // Default password is the user ID if not provided
      role: 'worker', // Registration via Page 6 is for workers
      name,
      phone,
      dob: dob || '',
      address: address || '',
      aadhar: 'mock_aadhar_path.pdf',
      pan: 'mock_pan_path.pdf',
      image: 'mock_photo_path.jpg',
      nozzle: '' // Set to empty initially
    };

    await DbWrapper.createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Worker registered successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        nozzle: '',
        dob: newUser.dob,
        address: newUser.address
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
};

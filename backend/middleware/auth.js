import jwt from 'jsonwebtoken';
import { readDataFile } from '../utils/storage.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ballot-box-demo-secret-change-in-production';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export async function getUserById(userId) {
  const users = await readDataFile('users.json') || { users: [] };
  return users.users?.find(u => u.id === userId);
}

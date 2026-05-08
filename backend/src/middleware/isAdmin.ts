import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import db from '../config/database';

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await db('users').where({ id: req.userId }).first();
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
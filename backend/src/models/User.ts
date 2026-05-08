import db from '../config/database';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export const UserModel = {
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const [result] = await db('users').insert(user).returning('*');
    return result;
  },
  
  async findByEmail(email: string) {
    return await db('users').where({ email }).first();
  },
  
  async findByUsername(username: string) {
    return await db('users').where({ username }).first();
  },
  
  async findById(id: string) {
    return await db('users').where({ id }).first();
  }
};
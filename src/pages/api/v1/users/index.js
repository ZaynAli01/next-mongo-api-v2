import { getAllUsers, deleteAllUsers } from '@/controllers/user.js';
import connectDB from '@/config/db-connect.js';
import authenticateUser from '@/middleware/user-middleware.js';

export default async function handler(req, res) {
  await connectDB();


  if (req.method === 'GET') {
    return authenticateUser(req, res, () => getAllUsers(req, res));
  }

  if (req.method === 'DELETE') {
    return authenticateUser(req, res, () => deleteAllUsers(req, res));
  }

  res.status(405).json({ message: 'Method not allowed' });
}

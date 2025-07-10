import { deleteUser } from '@/controllers/user.js';
import connectDB from '@/config/db-connect.js';
import authenticateUser from '@/middleware/user-middleware.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'DELETE') {
    return authenticateUser(req, res, () => deleteUser(req, res));
  }

  res.status(405).json({ message: 'Method not allowed' });
}
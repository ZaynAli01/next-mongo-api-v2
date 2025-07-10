import connectDB from '@/config/db-connect';
import authenticateUser from '@/middleware/user-middleware';
import { getUserById } from '@/controllers/user';



export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    return authenticateUser(req, res, () => getUserById(req, res));
  }

  res.status(405).json({ message: 'Method not allowed' });
}
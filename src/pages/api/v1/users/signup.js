import { signUp } from '@/controllers/user.js';
import connectDB from '@/config/db-connect.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    return signUp(req, res);
  }

  res.status(405).json({ message: 'Method not allowed' });
}

import { updateUser } from '@/controllers/user.js';
import connectDB from '@/config/db-connect.js';
import authenticateUser from '@/middleware/user-middleware.js';
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'PUT') {
    return authenticateUser(req, res, () => updateUser(req, res));
  }

  res.status(405).json({ message: 'Method not allowed' });
}
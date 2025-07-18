import { placeOrder, viewOrder } from '@/controllers/orderPlace'
import connectDB from '@/config/db-connect';
import authenticateUser from "@/middleware/user-middleware";

export default async function handler(req, res) {
  await connectDB()

  if (req.method === "POST") {
    return authenticateUser(req, res, () => placeOrder(req, res))
  }

  if (req.method === "GET") {
    return authenticateUser(req, res, () => viewOrder(req, res))
  }

  res.status(405).json({ message: 'Method not allowed' });
}

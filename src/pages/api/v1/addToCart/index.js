import connectDB from "@/config/db-connect";
import authenticateUser from "@/middleware/user-middleware";
import { getAllProducts } from "@/controllers/addToCart";

export default async function handler(req, res) {
  connectDB()

  if (req.method === 'GET') {
    return authenticateUser(req, res, () => getAllProducts(req, res))
  }

  res.status(405).json({ message: 'Method not allowed' });
}
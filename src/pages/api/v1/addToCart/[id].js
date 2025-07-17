import connectDB from "@/config/db-connect";
import authenticateUser from "@/middleware/user-middleware";
import { createCart, removeToCart } from "@/controllers/addToCart";

export default async function handler(req, res) {
  connectDB()

  if (req.method === 'POST') {
    return authenticateUser(req, res, () => createCart(req, res))
  }


  if (req.method === 'DELETE') {
    return authenticateUser(req, res, () => removeToCart(req, res))
  }

  res.status(405).json({ message: 'Method not allowed' });
}
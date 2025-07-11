import connectDB from "@/config/db-connect";
import authenticateUser from "@/middleware/user-middleware";
import { createWishList, removeWishList } from "@/controllers/wishList";

export default async function handler(req, res) {
  connectDB()

  if (req.method === 'POST') {
    return authenticateUser(req, res, () => createWishList(req, res))
  }


  if (req.method === 'DELETE') {
    return authenticateUser(req, res, () => removeWishList(req, res))
  }

  res.status(405).json({ message: 'Method not allowed' });
}
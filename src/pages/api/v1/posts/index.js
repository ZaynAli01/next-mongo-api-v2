import connectDB from '@/config/db-connect';
import { createPost, getAllPosts, deleteAllPosts } from '@/controllers/posts';
import { authenticateUser } from '@/middleware/user-middleware';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'POST') {
    return authenticateUser(req, res, () => createPost(req, res));
  }

  if (req.method === 'GET') {
    return authenticateUser(req, res, async () => {
      await getAllPosts(req, res);
    });
  }


  if (req.method === 'DELETE') {
    return authenticateUser(req, res, async () => {
      await deleteAllPosts(req, res);
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}

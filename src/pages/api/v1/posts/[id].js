import connectDB from '@/config/db-connect';
import { getPostById, updatePost, deletePost } from '@/controllers/posts';
import authenticateUser from '@/middleware/user-middleware';
import { parseForm } from '@/utils/parseForm.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    return authenticateUser(req, res, async () => {
      await getPostById(req, res);
    });
  }

  if (req.method === 'PUT') {
    return authenticateUser(req, res, async () => {
      try {
        const { fields, files } = await parseForm(req);
        return await updatePost(req, res, fields, files);
      } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: error.message });
      }
    });
  }

  if (req.method === 'DELETE') {
    return authenticateUser(req, res, async () => {
      await deletePost(req, res);
    });
  }

  res.status(405).json({ success: false, message: 'Method Not Allowed' });
}

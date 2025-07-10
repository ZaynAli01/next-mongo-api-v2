import connectDB from '../../config/db-connect';

export default async function handler(req, res) {
  try {
    await connectDB();
    res.status(200).json({
      connected: true,
      message: 'Database connection successful'
    })
  } catch (error) {
    res.status(500).json({
      connected: false,
      message: 'Database connection failed',
      error: error.message
    })
  }
}
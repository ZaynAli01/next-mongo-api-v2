import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  }
});

export default mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

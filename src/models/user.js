import mongoose from 'mongoose';
import Post from '@/models/post.js';
import wishList from '@/models/wishList';
import { v2 as cloudinary } from 'cloudinary';


const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      select: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('findOneAndDelete', async function (next) {
  const user = await this.model.findOne(this.getFilter());

  if (user) {
    const posts = await Post.find({ user: user._id });

    for (const post of posts) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (err) {
        console.error('Cloudinary deletion error:', err);
      }
      await post.deleteOne();
    }

    try {
      const wishlist = await wishList.findOne({ user: user._id });
      if (wishlist) {
        await wishlist.deleteOne({ user: user._id });
      } else {
        console.log('No wishlist found for user:', user._id);
      }
    } catch (err) {
      console.error('Wishlist deletion error:', err);
    }

  }

  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);

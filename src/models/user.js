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
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
      default: null,
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: "{VALUE} is not a valid gender"
      },
      default: null,
      lowercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      message: '{VALUE} is not a valid date'
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
    image: {
      type: String,
      default: null
    },
    imagePublicId: {
      type: String,
      default: null
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    bio: {
      type: String,
      select: true,
      default: null
    },
  },
  { timestamps: true }
);

userSchema.pre('findOneAndDelete', async function (next) {
  const user = await this.model.findOne(this.getFilter());

  if (user.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(user.imagePublicId);
    } catch (error) {
      console.error('Cloudinary deletion error:', err);
    }
  }

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

import Post from '@/models/post';
import cloudinary from '@/config/cloudinary';
import { parseForm } from '@/utils/parseForm.js';
import mongoose from 'mongoose';


export const createPost = async (req, res) => {
  try {
    const { fields, files } = await parseForm(req);
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile || !imageFile.filepath) {
      return res.status(400).json({ error: 'No image file received' });
    }

    const result = await cloudinary.uploader.upload(imageFile.filepath, {
      folder: 'nextjs_tests',
    });

    const { title, description } = fields;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const post = await Post.create({
      title: title.toString(),
      description: description.toString(),
      image: result.secure_url,
      imagePublicId: result.public_id,
      user: req.user._id,
    });

    return res.status(201).json({ message: 'Post created successfully', post });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePost = async (req, res, fields, files) => {
  try {
    const postId = req.query.id || fields.id?.toString();

    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({ error: 'Post not found' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingPost = await Post.findOne({ _id: postId, user: userId });

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found or not authorized' });
    }

    const updateData = {
      title: fields.title?.toString() || existingPost.title,
      description: fields.description?.toString() || existingPost.description,
    };

    if (files?.image) {
      const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

      if (existingPost.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(existingPost.imagePublicId);
        } catch (cloudErr) {
          console.error('Error deleting old image from Cloudinary:', cloudErr.message);
        }
      }

      const result = await cloudinary.uploader.upload(imageFile.filepath, {
        folder: 'nextjs_posts',
      });

      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost,
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user._id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Post not Found' });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = await Post.findOne({ _id: id, user: userId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not authorized to delete',
      });
    }

    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err.message);
      }
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Post and image deleted successfully',
      deletedPost: post,
    });

  } catch (err) {
    console.error('Error deleting post:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user._id;

    if (!id || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Both postId and userId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = await Post.findOne({ _id: id, user: userId })
      .populate('user', 'userName email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found for this user',
      });
    }

    return res.status(200).json({
      success: true,
      post: {
        _id: post._id,
        title: post.title,
        description: post.description,
        image: post.image,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({ user: userId })
      .populate('user', 'userName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts: posts.map(post => ({
        _id: post._id,
        title: post.title,
        description: post.description,
        image: post.image,
        user: post.user,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
};

export const deleteAllPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const postsToDelete = await Post.find({ user: userId });

    if (postsToDelete.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No posts found to delete for this user.',
        deletedCount: 0,
        deletedPosts: [],
      });
    }

    for (const post of postsToDelete) {
      if (post.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(post.imagePublicId);
        } catch (cloudErr) {
          console.error(`Cloudinary error for post ${post._id}:`, cloudErr.message);
        }
      }
    }

    await Post.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message: `${postsToDelete.length} posts deleted successfully for this user.`,
      deletedCount: postsToDelete.length,
      deletedPosts: postsToDelete.map(post => ({
        id: post._id,
        title: post.title,
        description: post.description,
        image: post.image,
        user: post.user,
      })),
    });
  } catch (err) {
    console.error('Error deleting user posts:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete posts' });
  }
};

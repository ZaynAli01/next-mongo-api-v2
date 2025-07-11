import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/utils/jwt.js';
import { signUpValidationSchema, signInValidationSchema } from '@/utils/validations.js';
import mongoose from 'mongoose';


export const signUp = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    await signUpValidationSchema.validate(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userName = email.split('@')[0];

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    return res.status(200).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    await signInValidationSchema.validate(req.body);

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, userName } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ error: 'Email is already in use by another user' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { userName, email },
      { new: true, runValidators: true }
    ).select('userName email');

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User updated successfully',
      user: updated,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const deletedUser = await User.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User and all associated data deleted successfully',
      user: {
        id: deletedUser._id,
        userName: deletedUser.userName,
        email: deletedUser.email,
      },
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const requestedId = req.query.id;

    if (!mongoose.Types.ObjectId.isValid(requestedId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await User.findById(requestedId).select('-password'); //

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const deleteAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    if (users.length === 0) {
      return res.status(200).json({
        message: 'No users to delete',
        deletedCount: 0,
        deletedUsers: [],
      });
    }
    const deletedUsers = [];
    for (const user of users) {
      const deleted = await User.findOneAndDelete({ _id: user._id });
      if (deleted) {
        deletedUsers.push({
          id: deleted._id,
          userName: deleted.userName,
          email: deleted.email,
        });
      }
    }

    return res.status(200).json({
      message: 'All users and associated data deleted successfully',
      deletedUsers,
      totalUsersDeleted: deletedUsers.length,
    });

  } catch (error) {
    console.error('Error deleting all users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    return res.status(200).json({
      message: 'All users retrieved successfully',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllPostsByUserId = async (req, res) => {
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
        user: {
          _id: post.user._id,
          userName: post.user.userName,
          email: post.user.email,
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
};

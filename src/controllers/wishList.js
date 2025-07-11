import Wishlist from '@/models/wishList';
import Posts from '@/models/post';
import mongoose from 'mongoose';


export const createWishList = async (req, res) => {
  const { id } = req.query;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Posts.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        items: [post._id]
      });
    }
    else {
      const alreadyInWishlist = wishlist.items.some(
        (itemId) => itemId.toString() === post._id.toString()
      );

      if (alreadyInWishlist) {
        return res.status(400).json({ message: "Post already in wishlist" });
      }

      wishlist.items.push(post._id);
    }

    await wishlist.save();
    res.status(200).json({
      message: "Post added to wishlist",
      _id: wishlist._id,
      userId: wishlist.user,
      items: {
        _id: post._id,
        title: post.title,
        description: post.description,
        image: post.image
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const removeWishList = async (req, res) => {
  const { id } = req.query;
  const userId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Posts.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const originalLength = wishlist.items.length;

    wishlist.items = wishlist.items.filter((itemId) => {
      if (!itemId) return false;
      return itemId.toString() !== id;
    });

    if (wishlist.items.length === originalLength) {
      return res.status(400).json({ message: "Post was not in wishlist" });
    }

    await wishlist.save();

    res.status(200).json({
      message: "Post removed from wishlist",
      _id: wishlist._id,
      userId: wishlist.user,
      items: {
        _id: post._id,
        title: post.title,
        description: post.description,
        image: post.image
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const wishlist = await Wishlist.findOne({ user: userId }).populate('items');
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json({
      message: "Wishlist retrieved successfully",
      _id: wishlist._id,
      userId: wishlist.user,
      items: wishlist.items.map(post => ({
        _id: post._id,
        title: post.title,
        description: post.description,
        image: post.image
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

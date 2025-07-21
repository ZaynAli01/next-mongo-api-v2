import AddToCart from '@/models/addToCart';
import Posts from '@/models/post';
import mongoose from 'mongoose';
import { calculateTotalPrice } from '@/utils/calculateTotalPrice'

export const createCart = async (req, res) => {
  try {
    const { id } = req.query;
    let { quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!quantity || isNaN(quantity) || quantity < 1) {
      quantity = 1;
    } else {
      quantity = Number(quantity);
    }

    const product = await Posts.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`,
      });
    }

    let cart = await AddToCart.findOne({ user: userId });
    if (!cart) {
      cart = new AddToCart({ user: userId, products: [] });
    }

    const existingItem = cart.products.find(item => item.product.toString() === id);

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        return res.status(400).json({
          message: `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} left.`,
        });
      }
      existingItem.quantity += quantity;
    } else {
      cart.products.push({ product: id, quantity });
    }

    await cart.save();
    return res.status(200).json({ message: "Product added to cart", cart });

  } catch (error) {
    console.error("Error in createCart:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const removeToCart = async (req, res) => {
  const { id } = req.query;
  const { quantity, flag } = req.body;
  const userId = req.user._id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Posts.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cart = await AddToCart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const existingItem = cart.products.find(item => item.product.toString() === id);
    if (!existingItem) {
      return res.status(400).json({ message: "Product was not in Cart" });
    }

    if (Boolean(flag)) {
      cart.products = cart.products.filter(item => item.product.toString() !== id);
    } else {
      let qtyToSubtract = Number(quantity);
      if (!qtyToSubtract || qtyToSubtract < 1) {
        qtyToSubtract = 1;
      }

      if (existingItem.quantity > qtyToSubtract) {
        existingItem.quantity -= qtyToSubtract;
      } else {
        cart.products = cart.products.filter(item => item.product.toString() !== id);
      }
    }

    await cart.save();

    return res.status(200).json({
      message: flag ? "Product completely removed from cart" : "Product quantity updated",
      cart,
    });

  } catch (err) {
    console.error("Error removing from cart:", err);
    return res.status(500).json({ error: err.message });
  }
};


export const getAllProducts = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await AddToCart.findOne({ user: userId }).populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({
      message: "Products retrieved successfully",
      count: cart.products.length,
      cartId: cart._id,
      userId: cart.user,
      products: cart.products.map(item => {
        const totalPrice = calculateTotalPrice(item.quantity, item.product.discountPrice);
        return {
          _id: item.product._id,
          title: item.product.title,
          description: item.product.description,
          image: item.product.image,
          stock: item.product.stock,
          inStock: item.product.inStock,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          category: item.product.category,
          quantity: item.quantity,
          totalPrice: totalPrice
        };
      })
    });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

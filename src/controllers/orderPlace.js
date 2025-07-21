import Order from "@/models/orderPlace.js";
import Cart from "@/models/addToCart";
import Product from "@/models/post"
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      paymentMethod
    } = req.body;

    if (!address || !city || !country || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: fullName, address, city, country, phone"
      });
    }
    const cart = await Cart.findOne({ user: userId }).populate("products.product");
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    let totalAmount = 0;
    const orderItems = cart.products.map(item => {
      const price = item.product.discountPrice || item.product.price;
      const subtotal = price * item.quantity;
      totalAmount += subtotal;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price
      };
    });
    if (paymentMethod === "COD") {
      const order = new Order({
        user: userId,
        paymentMethod,
        totalAmount,
        shippingAddress: { fullName, address, city, state, postalCode, country, phone },
        orderItems,
        status: "Pending"
      });
      await order.save();
      await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } });

      return res.status(201).json({
        success: true,
        message: "Order placed successfully (COD)",
        totalAmount,
        order
      });
    }

    if (paymentMethod === "ONLINE" || paymentMethod === "onLine") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: orderItems.map(item => ({
          price_data: {
            currency: "usd",
            product_data: { name: `Product ${item.product}` },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        })),
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel"
      });

      return res.status(200).json({
        success: true,
        message: "Stripe Checkout Session created",
        url: session.url
      });
    }

    return res.status(400).json({ success: false, message: "Invalid payment method" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const viewOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    //use correct variables name
    const orders = await Order.find({ user: userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }
    //refine it
    const formattedOrders = orders.map((order) => {
      return {
        id: order.id,
        totalPrice: order.totalAmount,
        products: order.orderItems.map((item) => {
          return {
            title: item.product.title,
            description: item.product.description,
            image: item.product.image,
            quantity: item.quantity,
            price: item.price,
          };
        })
      }
    })

    res.status(200).json({
      success: true,
      message: "All Orders Retrieved Successfully",
      user: userId,
      orders: formattedOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//pagination
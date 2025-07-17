import Order from "@/models/orderPlace.js";
import Cart from "@/models/addToCart";
import Product from "@/models/post"

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, address, city, state, postalCode, country, phone, paymentMethod = "COD" } = req.body;

    if (!fullName || !address || !city || !country || !phone) {
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
        price: price
      };
    });

    const order = new Order({
      user: userId,
      shippingAddress: { fullName, address, city, state, postalCode, country, phone },
      paymentMethod,
      orderItems,
      totalAmount,
      status: "Pending"
    });

    await order.save();

    await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const viewOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const ordersCart = await Order.find({ user: userId });

    if (!ordersCart || ordersCart.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    const formattedOrders = await Promise.all(
      ordersCart.map(async order => {
        const detailedItems = await Promise.all(
          order.orderItems.map(async item => {
            const product = await Product.findById(item.product).select("title description image");
            return {
              title: product.title,
              description: product.description,
              image: product.image,
              quantity: item.quantity,
              price: item.price,
            };
          })
        );
        return {
          orderId: order._id,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          status: order.status,
          totalAmount: order.totalAmount,
          product: detailedItems,
        };
      })
    );

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

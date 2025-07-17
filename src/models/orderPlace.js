import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, required: true },
  phone: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "post", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      discountPrice: { type: Number }
    }
  ]
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;

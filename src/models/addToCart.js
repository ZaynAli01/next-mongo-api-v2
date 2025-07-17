import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
      quantity: { type: Number, min: 1, default: 1 },
      totalPrice: { type: Number, default: 0 }
    }
  ]
});

export default mongoose.models.AddToCart || mongoose.model('AddToCart', cartSchema);

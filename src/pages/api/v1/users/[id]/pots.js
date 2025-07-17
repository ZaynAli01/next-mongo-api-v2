import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    imagePublicId: {
      type: String,
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    price: {
      type: Number,
      min: [0, 'Price must be greater than or equal to 0'],
      default: 0
    },
    discountPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price must be less than the original price',
      },
    },
    category: {
      type: String,
      index: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model('Post', postSchema);

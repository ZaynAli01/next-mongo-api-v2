import mongoose from 'mongoose';


const Post = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be greater than or equal to 0'],
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    index: true,
    default: null
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  instock: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^https?:\/\/.*\.(jpg|jpeg|png|gif)$/.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`
    }
  },
  images: [
    {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
  ],
  imagePublicId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', Post);

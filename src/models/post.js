import mongoose from 'mongoose';


const postSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
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
  imagePublicId: {
    type: String,
    required: true // because you need this to delete image from Cloudinary
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', postSchema);


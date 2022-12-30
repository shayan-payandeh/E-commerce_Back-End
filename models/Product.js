import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    image: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    rate: { type: String, required: true, default: 0 },
    reviews: { type: String, required: true, default: 0 },
    countInStock: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

ProductSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', ProductSchema);

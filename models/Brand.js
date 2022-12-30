import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3 },
  },
  {
    timestamps: true,
  }
);

brandSchema.plugin(mongoosePaginate);

export default mongoose.model('Brand', brandSchema);

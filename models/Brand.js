import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Brand', brandSchema);

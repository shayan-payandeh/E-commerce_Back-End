import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Category', categorySchema);

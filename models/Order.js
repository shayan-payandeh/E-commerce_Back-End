import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { userSchema } from './User.js';
const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullname: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    totalItemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    isDelievered: { type: Boolean, required: true, default: false },
    createdAt: {
      type: String,
      required: true,
    },
    persianCreatedAt: {
      type: String,
      required: true,
    },
    paidAt: { type: Date },
    delieveredAt: { type: Date },
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: false },
      isAdmin: { type: Boolean, default: false, required: true },
      persianCreatedAt: { type: String, required: true },
      time: { type: String, required: true },
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'User',
    },
  },

  {
    timestamps: true,
  }
);

orderSchema.plugin(mongoosePaginate);

export default mongoose.model('Order', orderSchema);

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    persianCreatedAt: { type: String, required: true },
    time: { type: String, required: true },
    // phoneNumber: { type: String, required: true, unique: true },
    // resetLink: { data: String, default: "" },
    // biography: { type: String, default: "Web Developer" },
    // bookmarkedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    // likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.plugin(mongoosePaginate);
export default mongoose.model('User', userSchema);

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  storage_used: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
  auth_method: { type: String, default: null }
});

export default mongoose.model("users", UserSchema);

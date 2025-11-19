import mongoose, { Schema, model } from "mongoose";

const AlbumSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  description: {
    type: String,
    default: "",
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  exposure: {
    type: String,
    enum: ["public", "unlisted", "private"],
    default: "private",
  },
});

export default model("Album", AlbumSchema);

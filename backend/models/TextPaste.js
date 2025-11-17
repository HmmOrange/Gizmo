import mongoose from "mongoose";

const PasteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  title: String,
  content: {
    type: String,
    required: true,
  },
  password: String,
  exposure: {
    type: String,
    default: "PUBLIC",
    enum: ["PUBLIC", "PRIVATE"],
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
  date_of_expiry: Date,
});

export default mongoose.model("Paste", PasteSchema);

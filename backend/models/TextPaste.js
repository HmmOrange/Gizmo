import mongoose from "mongoose";

const PasteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  slug: { type: String, unique: true, sparse: true },
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

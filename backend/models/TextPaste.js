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
  date_deleted: Date,
  remote_address: String,
});

export default mongoose.model("Paste", PasteSchema);

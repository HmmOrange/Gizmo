import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import textPasteRoutes from "./routes/textPasteRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

// Routes
app.use("/paste", textPasteRoutes);
app.get('/health', (req, res) => res.send('OK'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./config/db.js";
import textPasteRoutes from "./routes/textPasteRoutes.js";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import oauthRoutes from "./routes/authOAuth.js";
import passport from "passport";

const app = express();

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// DB
connectDB();

app.use("/api/auth/oauth", oauthRoutes);
app.use("/paste", textPasteRoutes);
app.use("/api/auth", authRoutes);
app.get("/health", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

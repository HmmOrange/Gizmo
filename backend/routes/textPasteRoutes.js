import express from "express";
import { createPaste, getAllPastes, getPasteById, exportPaste, summarizePaste } from "../controllers/textPasteController.js";
import { authUser, optionalAuth } from "../middleware/authUser.js";

const app = express.Router();

app.use(express.json());

app.post('/', optionalAuth, createPaste);
app.get('/', getAllPastes);
app.get('/:id', getPasteById);
app.get('/:id/export', exportPaste);
app.get("/:id/summary", summarizePaste);

export default app;
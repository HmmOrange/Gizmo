import express from "express";
import { createPaste, getAllPastes, getPasteById, exportPaste, summarizePaste } from "../controllers/textPasteController.js";

const app = express.Router();

app.use(express.json());

app.post('/', createPaste);
app.get('/', getAllPastes);
app.get('/:id', getPasteById);
app.get('/:id/export', exportPaste);
app.get("/:id/summary", summarizePaste);

export default app;
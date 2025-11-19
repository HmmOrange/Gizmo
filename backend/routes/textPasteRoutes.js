import express from "express";
import { createPaste, getAllPastes, getPasteById, exportPaste } from "../controllers/textPasteController.js";

const app = express.Router();

app.use(express.json());

app.post('/', createPaste);
app.get('/', getAllPastes);
app.get('/:id', getPasteById);
app.get('/:id/export', exportPaste);

export default app;
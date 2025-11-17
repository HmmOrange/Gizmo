import express from "express";
import { createPaste, getAllPastes, getPasteById } from "../controllers/textPasteController.js";

const app = express.Router();

app.use(express.json());

app.post('/', createPaste);
app.get('/', getAllPastes);
app.get('/:id', getPasteById);

export default app;
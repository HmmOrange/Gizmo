import Paste from "../models/TextPaste.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import puppeteer from "puppeteer";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";
dotenv.config();

// Create a new paste
export const createPaste = async (req, res) => {
  try {
    const { title, content, password, expiredAt, slug, exposure } = req.body;

    if (slug) {
      const exists = await Paste.findOne({ slug });
      if (exists) {
        return res.status(409).json({ error: "Slug already in use." });
      }
    }
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    let id = uuidv4();
    const paste = new Paste({
      slug: slug || id,
      title,
      content,
      hashedPassword: hashedPassword,
      exposure: exposure || "public",
      expiredAt: expiredAt ? new Date(expiredAt) : null,
      date_created: new Date(),
      authorId: req.user?.user_id || null,
    });
    await paste.save();
    res.status(201).json(paste);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Get all public, not expired pastes
export const getPublicPastes = async (req, res) => {
  try {
    const now = new Date();

    const pastes = await Paste.find({
      exposure: "PUBLIC",
      $or: [{ date_of_expiry: null }, { date_of_expiry: { $gt: now } }],
      date_deleted: null,
    }).sort({ date_created: -1 });

    res.json(pastes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get paste by ID
export const getPasteById = async (req, res) => {
  try {
    const now = new Date();
    const paste = await Paste.findOne({
      slug: req.params.id,
      $or: [{ date_of_expiry: null }, { date_of_expiry: { $gt: now } }],
    });

    if (!paste) {
      return res.status(404).json({ message: "Paste not found or expired" });
    }
    // console.log(paste)
    if (paste.exposure === "private") {
      if (!req.user || req.user?.user_id !== paste.authorId) {
        return res.status(403).json({ error: "Access denied" });
      }
    } else if (paste.exposure === "password_protected") {
      const inputPassword = req.query.password || "";
      console.log("inputPassword:", inputPassword)
      if (!bcrypt.compareSync(inputPassword, paste.hashedPassword)) {
        // console.log("wrong")
        return res.status(403).json({ error: "Password required or incorrect" });
      }
    }
    paste.views++;
    await paste.save();
    res.json(paste);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePaste = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, expiredAt } = req.body;

    const paste = await Paste.findOne({ slug: id });

    if (!paste) {
      return res.status(404).json({ error: "Paste not found" });
    }

    if (!req.user || req.user.user_id !== paste.authorId) {
      return res.status(403).json({ error: "You are not the owner of this paste" });
    }
    console.log("Updating paste:", content);
    if (title) paste.title = title;
    if (content) paste.content = content;
    if (expiredAt !== undefined) paste.expiredAt = expiredAt ? new Date(expiredAt) : null;

    await paste.save();

    res.json({
      message: "Paste updated successfully",
      paste
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const exportPaste = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.query; // 'raw', 'png', or 'pdf'

    const paste = await Paste.findOne({ slug: id });
    if (!paste) {
      return res.status(404).json({ message: "Paste not found" });
    }

    if (format === "raw" || format === "markdown") {
      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", `attachment; filename="${paste.slug}.md"`);
      return res.send(paste.content);
    } else if (format === "png") {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(`<pre style='font-family:monospace;font-size:16px;'>${paste.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
      const buffer = await page.screenshot({ fullPage: true });
      await browser.close();
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename="${paste.slug}.png"`);
      return res.send(buffer);
    } else if (format === "pdf") {
      const doc = new PDFDocument();
      let chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${paste.slug}.pdf"`);
        return res.send(pdfBuffer);
      });
      doc.font('Courier').fontSize(12).text(paste.content);
      doc.end();
    } else {
      return res.status(400).json({ message: "Invalid format specified" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const summarizePaste = async (req, res) => {
  try {


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error summarizing paste" });
  }
};


// backend/controllers/imageController.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    let slug = req.body.slug?.trim();

    // Nếu người dùng nhập slug → làm sạch
    if (slug) {
      slug = slug.toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (!slug) return res.status(400).json({ message: "Invalid slug" });
    } else {
      slug = nanoid(); // tự động
    }

    const key = `images/${slug}.png`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: "image/png",
        // ACL: "public-read",
      })
    );

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const shareLink = `${process.env.FRONTEND_URL}/share/image/${slug}`;

    res.json({ success: true, slug, shareLink, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};
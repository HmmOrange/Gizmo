import Paste from "../models/TextPaste.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

const SALT_ROUNDS = 12;

export class PasteService {
  // ------------------ CREATE ------------------
  async createPaste(data) {
    let {
      title,
      content,
      slug,
      exposure = "public",
      password,
      expiredAt,
      authorId = null,
    } = data;

    if (exposure === "password_protected" && !password)
      throw new Error("Password là bắt buộc khi chọn password_protected");

    if (exposure === "private" && !authorId)
      throw new Error("Chỉ user đăng nhập mới được tạo paste private");

    // Handle slug
    if (slug) {
      // Check uniqueness in DB
      slug = slug.trim();
      const existing = await Paste.findOne({ slug });
      if (existing) throw new Error("Slug đã được sử dụng, hãy chọn slug khác");
    } else if (exposure === "unlisted") {
      // Auto-generate slug for unlisted pastes
      slug = nanoid(12);
    } else {
      slug = null; // public or private pastes don't need slug
    }

    let hashedPassword = null;
    if (password) hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const paste = new Paste({
      slug,
      title: title.trim(),
      content,
      hashedPassword,
      exposure,
      expiredAt: expiredAt ? new Date(expiredAt) : null,
      authorId,
      views: 0,
    });

    await paste.save();
    return this._sanitize(paste, authorId);
  }

  // ------------------ READ ------------------
  async getPasteById(id) {
    const paste = await Paste.findOne(id);
    if (!paste) throw new Error("Paste không tồn tại");

    // Optional: expire check (TTL index will delete automatically)
    if (paste.expiredAt && paste.expiredAt < new Date()) {
      await paste.deleteOne();
      throw new Error("Paste đã hết hạn");
    }

    return this._sanitize(paste);
  }

  async getPasteBySlug(slug) {
    const paste = await Paste.findOne({ slug });
    if (!paste) throw new Error("Paste không tồn tại");

    if (paste.expiredAt && paste.expiredAt < new Date()) {
      await paste.deleteOne();
      throw new Error("Paste đã hết hạn");
    }

    return this._sanitize(paste);
  }

  // ------------------ UPDATE ------------------
  async updatePaste(id, updates, userId) {
    const paste = await Paste.findOne(id);
    if (!paste) throw new Error("Paste không tồn tại");

    // Only owner can edit
    if (paste.authorId && paste.authorId !== userId) {
      throw new Error("Bạn không có quyền chỉnh sửa paste này");
    }

    // Prevent changing authorId
    if (updates.authorId !== undefined) {
      throw new Error("Không thể thay đổi authorId của paste");
    }

    // Allowed fields (except authorId)
    const allowedFields = [
      "title",
      "content",
      "exposure",
      "expiredAt",
      "slug",
      "password",
    ];

    const filtered = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    // 1. Handle custom slug update
    if (filtered.slug !== undefined) {
      const cleanSlug = filtered.slug.trim();

      // If slug is cleared
      if (cleanSlug === "") {
        filtered.slug = null;
      } else {
        // Check uniqueness
        const existing = await Paste.findOne({
          slug: cleanSlug,
          id,
        });
        if (existing) throw new Error("Slug đã được sử dụng");
        filtered.slug = cleanSlug;
      }
    }

    // 2. Handle exposure change
    if (filtered.exposure !== undefined) {
      const newExposure = filtered.exposure;

      // private requires author
      if (newExposure === "private" && !paste.authorId) {
        throw new Error("Paste private yêu cầu authorId");
      }

      // unlisted → ensure slug exists
      if (newExposure === "unlisted" && !paste.slug && !filtered.slug) {
        filtered.slug = nanoid(12);
      }

      // public or unlisted → remove password
      if (newExposure !== "password_protected") {
        filtered.hashedPassword = null;
      }
    }

    // 3. Handle password update
    if (filtered.password !== undefined) {
      if (!filtered.password) {
        filtered.hashedPassword = null; // clear password if empty string
        filtered.exposure = "public"; // optional: auto-unprotect
      } else {
        filtered.hashedPassword = await bcrypt.hash(
          filtered.password,
          SALT_ROUNDS
        );
        filtered.exposure = "password_protected";
      }
      delete filtered.password;
    }

    // 4. expiredAt normalization
    if (filtered.expiredAt !== undefined) {
      filtered.expiredAt = filtered.expiredAt
        ? new Date(filtered.expiredAt)
        : null;
    }

    // Apply updates
    Object.assign(paste, filtered);
    await paste.save();

    return this._sanitize(paste, userId);
  }

  // ------------------ DELETE ------------------
  async deletePaste(id, userId) {
    const paste = await Paste.findOne(id);
    if (!paste) throw new Error("Paste không tồn tại");

    if (paste.authorId && paste.authorId !== userId)
      throw new Error("Bạn không có quyền xóa paste này");

    await paste.deleteOne();
  }

  // ------------------ VIEWS ------------------
  async incrementViews(id) {
    return await Paste.findOneAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
  }

  // ------------------ ACCESS CONTROL ------------------
  async canAccessPaste(id, userId = null, password = null) {
    const paste = await Paste.findOne(id);
    if (!paste) throw new Error("Paste không tồn tại");

    // Hết hạn → xoá + deny
    if (paste.expiredAt && paste.expiredAt < new Date()) {
      await paste.deleteOne();
      throw new Error("Paste đã hết hạn");
    }

    // Private
    if (paste.exposure === "private") {
      if (!userId || paste.authorId !== userId)
        throw new Error("Paste này chỉ dành cho chủ sở hữu");
      return paste;
    }

    // Password protected
    if (paste.exposure === "password_protected") {
      const ok = await this.verifyPassword(paste, password);
      if (!password || !ok) throw new Error("Mật khẩu không đúng");
    }

    return paste;
  }

  // ------------------ PASSWORD ------------------
  async setPassword(id, password, userId) {
    if (!password) throw new Error("Password không được để trống");

    const paste = await Paste.findOne(id);
    if (!paste) throw new Error("Paste không tồn tại");
    if (paste.authorId !== userId) throw new Error("Không có quyền");

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    paste.hashedPassword = hash;
    paste.exposure = "password_protected";
    await paste.save();
  }

  async verifyPassword(id, password) {
    const paste = await Paste.findOne(id);
    if (!paste) throw new Error("Paste không tồn tại");

    if (paste.hashedPassword) return true;
    return await bcrypt.compare(password, paste.hashedPassword);
  }

  // ------------------ LIST / SEARCH ------------------
  async listUserPastes(
    authorId,
    { limit = 20, skip = 0, sort = { createdAt: -1 } } = {}
  ) {
    const pastes = await Paste.find({ authorId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    return pastes.map((p) => this._sanitize(p, authorId));
  }

  async searchPastes(query, { limit = 20, skip = 0 } = {}) {
    return await Paste.find({
      $text: { $search: query },
      exposure: { $in: ["public", "unlisted"] },
    })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  // ------------------ SANITIZE ------------------
  _sanitize(paste, userId = null) {
    const obj = paste.toObject ? paste.toObject() : { ...paste };
    delete obj.hashedPassword;

    // If private and viewer is not owner → hide content
    if (obj.exposure === "private" && userId !== obj.authorId) {
      obj.content = null;
    }
    return obj;
  }
}

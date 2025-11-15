const Paste = require('../models/TextPaste');
const { v4: uuidv4 } = require('uuid');

// Create a new paste
exports.createPaste = async (req, res) => {
    try {
        const { title, content, exposure, date_of_expiry } = req.body;
        const paste = new Paste({
            id: uuidv4(),
            title,
            content,
            exposure,
            date_of_expiry: date_of_expiry ? new Date(date_of_expiry) : undefined,
            date_created: new Date()
        });
        await paste.save();
        res.status(201).json(paste);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all public, not deleted, not expired pastes
exports.getAllPastes = async (req, res) => {
    try {
        const now = new Date();
        const pastes = await Paste.find({
            exposure: 'PUBLIC',
            $or: [
                { date_of_expiry: null },
                { date_of_expiry: { $gt: now } }
            ],
            date_deleted: null
        }).sort({ date_created: -1 });
        res.json({ pastes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single paste by id
exports.getPasteById = async (req, res) => {
    try {
        const now = new Date();
        const paste = await Paste.findOne({
            id: req.params.id,
            $or: [
                { date_of_expiry: null },
                { date_of_expiry: { $gt: now } }
            ],
            date_deleted: null
        });
        if (!paste) return res.status(404).json({ error: 'Paste not found or expired' });
        paste.views++;
        paste.last_viewed = now;
        await paste.save();
        res.json(paste);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
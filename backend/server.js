require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const pasteRoutes = require('./routes/textPasteRoutes');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use('/paste', pasteRoutes);

// Expiry cleanup every hour
const Paste = require('./models/TextPaste');
setInterval(async () => {
    try {
        const now = new Date();
        const expired = await Paste.updateMany(
            {
                date_deleted: null,
                date_of_expiry: { $lte: now, $ne: null }
            },
            { date_deleted: now }
        );
        if (expired.modifiedCount > 0) {
            console.log(`Expired ${expired.modifiedCount} pastes`);
        }
    } catch (err) {
        console.error('Expiry cleanup error:', err);
    }
}, 60 * 60 * 1000);

app.get('/health', (req, res) => res.send('OK'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`BinPastes Express server listening on port ${port}`);
});
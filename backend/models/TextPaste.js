const mongoose = require('mongoose');

const PasteSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    version: {
        type: Number,
        default: 1
    },
    title: String,
    content: {
        type: String,
        required: true
    },
    exposure: {
        type: String,
        default: 'PUBLIC',
        enum: ['PUBLIC', 'PRIVATE']
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    date_of_expiry: Date,
    date_deleted: Date,
    remote_address: String,
    last_viewed: Date,
    views: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Paste', PasteSchema);
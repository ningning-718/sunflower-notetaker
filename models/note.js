const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.ObjectId,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    keywords: {
        type: [String]
    },
    content: {
        type: String,
        required: true
    },
    create_time: {
        type: Date,
        default: Date.now
    },
    update_time: {
        type: Date,
        default: Date.now
    }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
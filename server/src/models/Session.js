const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    code: { type: String, default: '// Write your code here...\n' },
    language: { type: String, default: 'javascript' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);

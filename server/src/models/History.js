const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    code: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('History', historySchema);

module.exports = History;

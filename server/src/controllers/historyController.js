const History = require('../models/History');

const getHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        if (!roomId) {
            return res.status(400).json({ success: false, message: 'Room ID is required' });
        }

        const history = await History.find({ roomId }).sort({ timestamp: 1 });

        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        console.error('[History Controller Error]', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getHistory
};

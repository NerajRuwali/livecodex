const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/livecodex';
        await mongoose.connect(uri);
        console.log('[Database] MongoDB gracefully connected successfully');
    } catch (error) {
        console.error('[Database Error]', error.message);
        // NOTE: We do not process.exit(1) here natively to preserve the stateless socket functionalities 
        // across layouts if a user just cloned the repo locally without a fully deployed cluster available.
    }
};

module.exports = connectDB;

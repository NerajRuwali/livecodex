const dotenv = require('dotenv');

dotenv.config();

const config = {
    PORT: process.env.PORT || 5000,
    ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;

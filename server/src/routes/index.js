const express = require('express');
const { testRouteController } = require('../controllers/testController');
const { runCode } = require('../controllers/runController');
const { getHistory } = require('../controllers/historyController');

const router = express.Router();

// Basic Test Route
router.get('/', testRouteController);

// Code Execution Route
router.post('/run', runCode);

// Code Playback History Route
router.get('/history/:roomId', getHistory);

module.exports = router;

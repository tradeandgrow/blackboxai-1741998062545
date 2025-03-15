const express = require('express');
const router = express.Router();
const tradingService = require('../services/tradingService');
const { verifyToken } = require('./auth');
const logger = require('../utils/logger');

// Get latest forex rates
router.get('/rates', async (req, res, next) => {
    try {
        const rates = await tradingService.getLatestRates();
        res.json({
            success: true,
            data: rates
        });
    } catch (error) {
        next(error);
    }
});

// Execute a new trade (protected route)
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { pair, amount, type, price } = req.body;

        // Basic validation
        if (!pair || !amount || !type || !price) {
            return res.status(400).json({
                success: false,
                error: 'Please provide pair, amount, type, and price'
            });
        }

        // Validate trade type
        if (!['buy', 'sell'].includes(type.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: 'Trade type must be either buy or sell'
            });
        }

        const trade = await tradingService.executeTrade({
            userId: req.user.userId,
            pair,
            amount: parseFloat(amount),
            type: type.toLowerCase(),
            price: parseFloat(price)
        });

        res.status(201).json({
            success: true,
            data: trade
        });
    } catch (error) {
        next(error);
    }
});

// Get trade history (protected route)
router.get('/history', verifyToken, async (req, res, next) => {
    try {
        const trades = await tradingService.getTradeHistory(req.user.userId);
        res.json({
            success: true,
            data: trades
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

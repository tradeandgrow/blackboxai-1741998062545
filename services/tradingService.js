const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config/config');

// Simulated trade storage (replace with database in production)
const trades = [];

class TradingService {
    async getLatestRates() {
        try {
            // Simulated forex rates (replace with actual API call in production)
            return {
                "EUR/USD": 1.1234,
                "GBP/USD": 1.3456,
                "USD/JPY": 110.23,
                "USD/CHF": 0.9234,
                "AUD/USD": 0.7423,
                "USD/CAD": 1.2345
            };
        } catch (error) {
            logger.error('Error fetching forex rates:', error);
            throw new Error('Failed to fetch forex rates');
        }
    }

    async executeTrade({ userId, pair, amount, type, price }) {
        try {
            const trade = {
                id: Date.now().toString(),
                userId,
                pair,
                amount,
                type,
                price,
                timestamp: new Date(),
                status: 'executed'
            };
            
            trades.push(trade);
            logger.info('Trade executed successfully', { trade });
            
            return trade;
        } catch (error) {
            logger.error('Error executing trade:', error);
            throw new Error('Failed to execute trade');
        }
    }

    async getTradeHistory(userId) {
        try {
            return trades.filter(trade => trade.userId === userId);
        } catch (error) {
            logger.error('Error fetching trade history:', error);
            throw new Error('Failed to fetch trade history');
        }
    }
}

module.exports = new TradingService();

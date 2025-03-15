const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { error: err });

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized access'
        });
    }

    return res.status(500).json({
        success: false,
        error: 'Server error'
    });
};

module.exports = errorHandler;

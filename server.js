const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const errorHandler = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/trades', require('./routes/trades'));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});

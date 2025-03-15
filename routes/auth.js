const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

// Simulated user storage (replace with database in production)
const users = [];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide username, email and password' 
            });
        }

        // Check if user already exists
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword
        };

        users.push(user);
        logger.info('User registered successfully', { userId: user.id });

        // Create token
        const token = jwt.sign(
            { userId: user.id }, 
            config.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide email and password' 
            });
        }

        // Find user
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.id }, 
            config.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        logger.info('User logged in successfully', { userId: user.id });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
});

// Export middleware and router
module.exports = {
    router,
    verifyToken
};

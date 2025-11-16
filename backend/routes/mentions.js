// routes/mentions.js
const express = require('express');
const Mention = require('../models/Mention');
const { authenticateToken } = require('./auth');

const router = express.Router();

// @route   GET /api/mentions
// @desc    Get all mentions with filters
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      brand, 
      source, 
      sentiment, 
      startDate, 
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (brand) query.brand = brand;
    if (source) query.source = source;
    if (sentiment) query.sentiment = sentiment;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Execute query
    const mentions = await Mention.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Mention.countDocuments(query);

    res.json({
      mentions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get mentions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentions/:id
// @desc    Get single mention by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const mention = await Mention.findById(req.params.id);
    
    if (!mention) {
      return res.status(404).json({ message: 'Mention not found' });
    }

    res.json(mention);
  } catch (error) {
    console.error('Get mention error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentions/brand/:brandName
// @desc    Get mentions for a specific brand
// @access  Private
router.get('/brand/:brandName', authenticateToken, async (req, res) => {
  try {
    const { brandName } = req.params;
    const { timeRange = '24h', sentiment, source } = req.query;

    // Calculate time range
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case '1h':
        startDate = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }

    const query = {
      brand: new RegExp(brandName, 'i'),
      timestamp: { $gte: startDate }
    };

    if (sentiment) query.sentiment = sentiment;
    if (source) query.source = source;

    const mentions = await Mention.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(mentions);
  } catch (error) {
    console.error('Get brand mentions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/mentions
// @desc    Create new mention (for testing/manual entry)
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const mention = new Mention(req.body);
    await mention.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`brand_${mention.brand}`).emit('new_mention', mention);

    res.status(201).json(mention);
  } catch (error) {
    console.error('Create mention error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/mentions/:id
// @desc    Delete mention
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const mention = await Mention.findByIdAndDelete(req.params.id);
    
    if (!mention) {
      return res.status(404).json({ message: 'Mention not found' });
    }

    res.json({ message: 'Mention deleted successfully' });
  } catch (error) {
    console.error('Delete mention error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/mentions/search/:keyword
// @desc    Search mentions by keyword
// @access  Private
router.get('/search/:keyword', authenticateToken, async (req, res) => {
  try {
    const { keyword } = req.params;
    const { brand, limit = 50 } = req.query;

    const query = {
      $text: { $search: keyword }
    };

    if (brand) query.brand = brand;

    const mentions = await Mention.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit));

    res.json(mentions);
  } catch (error) {
    console.error('Search mentions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
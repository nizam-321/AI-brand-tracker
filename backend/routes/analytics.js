// routes/analytics.js
const express = require('express');
const Mention = require('../models/Mention');
const { authenticateToken } = require('./auth');

const router = express.Router();

// @route   GET /api/analytics/summary
// @desc    Get summary statistics
// @access  Private
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { brand, timeRange = '24h' } = req.query;

    if (!brand) {
      return res.status(400).json({ message: 'Brand parameter is required' });
    }

    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startDate = new Date(now - timeRanges[timeRange]);

    const query = {
      brand: new RegExp(brand, 'i'),
      timestamp: { $gte: startDate }
    };

    // Get all mentions
    const mentions = await Mention.find(query);

    // Calculate statistics
    const summary = {
      total: mentions.length,
      positive: mentions.filter(m => m.sentiment === 'positive').length,
      negative: mentions.filter(m => m.sentiment === 'negative').length,
      neutral: mentions.filter(m => m.sentiment === 'neutral').length,
      avgSentimentScore: mentions.reduce((acc, m) => acc + m.sentimentScore, 0) / mentions.length || 0,
      totalReach: mentions.reduce((acc, m) => acc + m.reach, 0),
      totalEngagement: mentions.reduce((acc, m) => 
        acc + m.engagement.likes + m.engagement.shares + m.engagement.comments, 0
      ),
      spikes: mentions.filter(m => m.isSpike).length
    };

    // Source distribution
    const sourceDistribution = {};
    mentions.forEach(m => {
      sourceDistribution[m.source] = (sourceDistribution[m.source] || 0) + 1;
    });

    // Topic distribution
    const topicDistribution = {};
    mentions.forEach(m => {
      topicDistribution[m.topic] = (topicDistribution[m.topic] || 0) + 1;
    });

    res.json({
      summary,
      sourceDistribution,
      topicDistribution,
      timeRange,
      calculatedAt: new Date()
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/timeline
// @desc    Get mentions over time
// @access  Private
router.get('/timeline', authenticateToken, async (req, res) => {
  try {
    const { brand, timeRange = '24h', interval = 'hour' } = req.query;

    if (!brand) {
      return res.status(400).json({ message: 'Brand parameter is required' });
    }

    const now = new Date();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startDate = new Date(now - timeRanges[timeRange]);

    // MongoDB aggregation for timeline
    const timeline = await Mention.aggregate([
      {
        $match: {
          brand: new RegExp(brand, 'i'),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: interval === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          total: { $sum: 1 },
          positive: {
            $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] }
          },
          negative: {
            $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] }
          },
          neutral: {
            $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] }
          },
          avgEngagement: {
            $avg: {
              $add: ['$engagement.likes', '$engagement.shares', '$engagement.comments']
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(timeline);
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/sentiment-trend
// @desc    Get sentiment trend over time
// @access  Private
router.get('/sentiment-trend', authenticateToken, async (req, res) => {
  try {
    const { brand, timeRange = '7d' } = req.query;

    if (!brand) {
      return res.status(400).json({ message: 'Brand parameter is required' });
    }

    const now = new Date();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startDate = new Date(now - timeRanges[timeRange]);

    const sentimentTrend = await Mention.aggregate([
      {
        $match: {
          brand: new RegExp(brand, 'i'),
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            sentiment: '$sentiment'
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$sentimentScore' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json(sentimentTrend);
  } catch (error) {
    console.error('Get sentiment trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/top-keywords
// @desc    Get most mentioned keywords
// @access  Private
router.get('/top-keywords', authenticateToken, async (req, res) => {
  try {
    const { brand, limit = 20 } = req.query;

    if (!brand) {
      return res.status(400).json({ message: 'Brand parameter is required' });
    }

    const keywords = await Mention.aggregate([
      {
        $match: { brand: new RegExp(brand, 'i') }
      },
      {
        $unwind: '$keywords'
      },
      {
        $group: {
          _id: '$keywords',
          count: { $sum: 1 },
          avgSentiment: { $avg: '$sentimentScore' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json(keywords);
  } catch (error) {
    console.error('Get top keywords error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/influencers
// @desc    Get top influencers/authors
// @access  Private
router.get('/influencers', authenticateToken, async (req, res) => {
  try {
    const { brand, limit = 10 } = req.query;

    if (!brand) {
      return res.status(400).json({ message: 'Brand parameter is required' });
    }

    const influencers = await Mention.aggregate([
      {
        $match: { brand: new RegExp(brand, 'i') }
      },
      {
        $group: {
          _id: '$author',
          mentionCount: { $sum: 1 },
          totalReach: { $sum: '$reach' },
          totalEngagement: {
            $sum: {
              $add: ['$engagement.likes', '$engagement.shares', '$engagement.comments']
            }
          },
          avgSentiment: { $avg: '$sentimentScore' },
          sources: { $addToSet: '$source' }
        }
      },
      {
        $sort: { totalReach: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json(influencers);
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/comparison
// @desc    Compare multiple brands
// @access  Private
router.get('/comparison', authenticateToken, async (req, res) => {
  try {
    const { brands, timeRange = '7d' } = req.query;

    if (!brands) {
      return res.status(400).json({ message: 'Brands parameter is required' });
    }

    const brandList = brands.split(',').map(b => b.trim());
    const now = new Date();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const startDate = new Date(now - timeRanges[timeRange]);

    const comparison = await Promise.all(
      brandList.map(async (brand) => {
        const mentions = await Mention.find({
          brand: new RegExp(brand, 'i'),
          timestamp: { $gte: startDate }
        });

        return {
          brand,
          total: mentions.length,
          positive: mentions.filter(m => m.sentiment === 'positive').length,
          negative: mentions.filter(m => m.sentiment === 'negative').length,
          neutral: mentions.filter(m => m.sentiment === 'neutral').length,
          totalReach: mentions.reduce((acc, m) => acc + m.reach, 0),
          avgSentiment: mentions.reduce((acc, m) => acc + m.sentimentScore, 0) / mentions.length || 0
        };
      })
    );

    res.json(comparison);
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
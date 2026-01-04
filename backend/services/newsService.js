//path: backend/services/newsService.js
// News API Integration (Free tier: 100 requests/day)

const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

async function fetchNewsMentions(brand) {
  try {
    if (!NEWS_API_KEY) {
      console.warn('⚠️  News API key not configured');
      return [];
    }

    console.log(`📰 Fetching News mentions for: ${brand}`);

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: brand,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 50
      },
      headers: {
        'X-API-Key': NEWS_API_KEY
      },
      timeout: 10000
    });

    const articles = response.data?.articles || [];

    if (articles.length === 0) {
      console.log(`ℹ️  No news articles found for ${brand}`);
      return [];
    }

    const formattedArticles = articles.map(article => {
      const text = (article.title || '') + ' ' + (article.description || '');
      return {
        text: text.substring(0, 500),
        author: article.author || article.source?.name || 'Unknown',
        authorHandle: article.source?.name || 'News Source',
        timestamp: new Date(article.publishedAt),
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 5000,
        url: article.url
      };
    });

    console.log(`✅ Fetched ${formattedArticles.length} news articles for ${brand}`);
    return formattedArticles;

  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ News API Rate Limited - Daily limit reached');
    } else if (error.response?.data) {
      console.error('❌ News API Error:', error.response.data);
    } else {
      console.error('❌ News API Error:', error.message);
    }
    return [];
  }
}

module.exports = { fetchNewsMentions };

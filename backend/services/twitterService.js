//path: backend/services/twitterService.js
// Real Twitter API v2 Integration

const axios = require('axios');

const TWITTER_BASE_URL = 'https://api.twitter.com/2';
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

async function fetchTwitterMentions(brand) {
  try {
    if (!BEARER_TOKEN) {
      console.warn('⚠️  Twitter Bearer Token not configured');
      return [];
    }

    console.log(`🐦 Fetching Twitter mentions for: ${brand}`);

    const response = await axios.get(`${TWITTER_BASE_URL}/tweets/search/recent`, {
      params: {
        query: `"${brand}" -is:retweet lang:en`,
        max_results: 100,
        'tweet.fields': 'created_at,public_metrics,author_id,lang',
        'expansions': 'author_id',
        'user.fields': 'username,verified,public_metrics'
      },
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'User-Agent': 'BrandTracker/1.0'
      },
      timeout: 10000
    });

    const tweets = response.data?.data || [];
    const users = response.data?.includes?.users || [];

    if (tweets.length === 0) {
      console.log(`ℹ️  No Twitter mentions found for ${brand}`);
      return [];
    }

    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });

    const formattedTweets = tweets.map(tweet => {
      const user = userMap[tweet.author_id] || { username: 'Unknown', followers_count: 0 };
      return {
        text: tweet.text,
        author: user.username || 'Unknown',
        authorHandle: `@${user.username}` || '@unknown',
        timestamp: new Date(tweet.created_at),
        likes: tweet.public_metrics?.like_count || 0,
        shares: tweet.public_metrics?.retweet_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        reach: ((tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0)) * (user.followers_count ? 1 : 1),
        url: `https://twitter.com/${user.username}/status/${tweet.id}`
      };
    });

    console.log(`✅ Fetched ${formattedTweets.length} tweets for ${brand}`);
    return formattedTweets;

  } catch (error) {
    if (error.response?.status === 429) {
      console.error('❌ Twitter API Rate Limited - wait 15 minutes');
    } else if (error.response?.data) {
      console.error('❌ Twitter API Error:', error.response.data);
    } else {
      console.error('❌ Twitter API Error:', error.message);
    }
    return [];
  }
}

module.exports = { fetchTwitterMentions };

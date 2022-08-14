// 0. authentication
const { TwitterApi } = require("twitter-api-v2");
const Twitter = require("twitter");

// Twitter API
exports.init_twitter_api = ()=> {
  return new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });
}
// Twitter API V2
exports.init_twitter_api_v2 =()=> {
  return new TwitterApi(process.env.BEARER_TOKEN);
}

// Twitter User info
exports.get_twitter_info =()=> {
  return {
    bot_screen_name: process.env.BOT_SCREEN_NAME,
    bot_id: process.env.BOT_ID,
  }
}
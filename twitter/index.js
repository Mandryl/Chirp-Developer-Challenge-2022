// 1.Stream & 2.Search
const { ETwitterStreamEvent } = require("twitter-api-v2");
const reply = require("./reply.js");
const auth = require("./authentication.js");

const logger = require("../common/logger.js");

// Get api
const user_info = auth.get_twitter_info();
const BOT_SCREEN_NAME = user_info.bot_screen_name;
const BOT_ID = user_info.bot_id;
const client = auth.init_twitter_api_v2();

const streaming = {};


streaming.startStream = async (callback) => {
  // // Get and delete old rules if needed
  const rules = await client.v2.streamRules();
  if (rules.data?.length) {
    await client.v2.updateStreamRules({
      delete: { ids: rules.data.map((rule) => rule.id) },
    });
  }

  // Add our rules
  await client.v2.updateStreamRules({
    add: [{ value: `@${BOT_SCREEN_NAME}` }],
  });
  const stream = await client.v2
    .searchStream({
      "tweet.fields": ["referenced_tweets", "author_id"],
      "user.fields": ["name", "username"],
      expansions: ["referenced_tweets.id", "author_id"],
    })
    .then((res) => {
      logger.info("Standby mode...\n");
      return res;
    })
    .catch((err) => {
      logger.error(err);
      throw err;
    });

  // Enable auto reconnect
  stream.autoReconnect = true;
  stream.on(ETwitterStreamEvent.Data, async (tweet) => {
    // Ignore RTs or self-sent tweets or Reply to Bot or Not Reply
    const isARt =
      tweet.data.referenced_tweets?.some(
        (tweet) => tweet.type === "retweeted"
      ) ?? false;
    if (isARt) {
      logger.info("Event: Detect untargeted tweets (Retweet).\nResponse: None\n");
      return;
    } else if (tweet.data.author_id === BOT_ID) {
      logger.info("Event: Detect untargeted tweets (BOT tweet).\nResponse: None\n");
      return;
    } else if (typeof tweet.includes.tweets === "undefined") {
      logger.info("Event: Detect untargeted tweets (Not reply).\nResponse: None\n");
      return;
    } else if (tweet.includes.tweets[0].author_id === BOT_ID) {
      logger.info("Event: Detect untargeted tweets (Reply to Bot).\nResponse: None\n");
      return;
    } else {
      // Input
      const input = {
        // User tweet
        username: tweet.includes.users[0].username,
        id: tweet.data.id,
        request_text: tweet.data.text,
        // Target
        target_text: tweet.includes.tweets[0].text,
      };
      // Action when mentioned
      logger.info(`Event: Tweet ${input.request_text} from @${input.username}`);
      await callback(input).then((res) => {
        return reply.reply_result(input, res);
      });
    }
  });
};



module.exports = streaming;

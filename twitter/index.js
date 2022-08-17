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

const isIgnoreEvent = (tweet) => {
  // Ignore RTs or self-sent tweets or Reply to Bot or Not Reply
  const isARt = tweet.data.referenced_tweets?.some(
    (tweet) => tweet.type === "retweeted"
  ) ?? false;
  const isBotTweet = (tweet.data.author_id === BOT_ID);
  const isNotReply = (typeof tweet.includes?.tweets === "undefined");
  const isReplyToBot = (
    tweet.includes?.tweets &&
    tweet.includes.tweets.length &&
    tweet.includes.tweets[0]?.author_id === BOT_ID
  );

  if (isARt) logger.info("Event: Detect untargeted tweets (Retweet). Response: None");
  if (isBotTweet) logger.info("Event: Detect untargeted tweets (BOT tweet). Response: None");
  if (isNotReply) logger.info("Event: Detect untargeted tweets (Not reply). Response: None");
  if (isReplyToBot) logger.info("Event: Detect untargeted tweets (Reply to Bot). Response: None");

  return isARt || isBotTweet || isNotReply || isReplyToBot;
};

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
  const stream = await client.v2.searchStream({
    "tweet.fields": ["referenced_tweets", "author_id"],
    "user.fields": ["name", "username"],
    expansions: ["referenced_tweets.id", "author_id"],
  }).catch((err) => {
    logger.error(`Code: ${err.code}, Detail: ${err.data.detail}`);
    throw err;
  });
  logger.info("Standby mode...");

  // Enable auto reconnect
  stream.autoReconnect = true;
  stream.on(ETwitterStreamEvent.Data, async (tweet) => {
    if (isIgnoreEvent(tweet)) return;

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

    const response = await callback(input).catch(error=>{
      logger.error(`Response Error:${error}`);
      const FAIL_NOT_ENG = require("../debater/config.json").message.response.failed_not_english;
      return `@${input.username} ${FAIL_NOT_ENG}`;
    });
    return reply.reply_result(input, response);
  });
};

module.exports = streaming;

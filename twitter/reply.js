// 4. Reply
const auth = require("./authentication.js");
const logger = require("../common/logger.js");

// Reply @{username} result_text to id
exports.reply_result = async (input, result_text) => {
  try {
    const client = auth.init_twitter_api();
    // Create reply text
    const res = this.preprocess_word(result_text);
    const params = {
      status: `@${input.username} ${res}`.slice(0, 280),
      in_reply_to_status_id: input.id,
    };

    // Reply
    client.post("statuses/update", params);
    logger.debug(`Response: ${params.status}\n`);
    return;
  } catch (error) {
    logger.error(error);
    throw err;
  }
};

// Preprocess text
exports.preprocess_word = (text) => {
  // Exclude menthion
  const regex_mention = /@+([a-zA-Z0-9亜-熙ぁ-んァ-ヶー-龥朗-鶴.\-_]+)/g;
  // Exclude attached things
  const regex_url = /(?:https?\:\/\/|www\.)[^\s]+/g;
  return text.replace(regex_mention, "").replace(regex_url.source, "");
};

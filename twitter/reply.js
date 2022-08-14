// 4. Reply
const auth = require("./authentication.js");
const logger = require("../common/logger.js");

// Reply @{username} result_text to id
exports.reply_result = async (input, result_text) => {
  try {
    const client = auth.init_twitter_api();
    const params = {
      status: `@${input.username} ${result_text}`,
      in_reply_to_status_id: input.id,
    };

    // Reply
    client.post("statuses/update", params);
    logger.info(`Response: ${params.status}\n`);
  } catch (error) {
    logger.error(error);
    throw err;
  }
};

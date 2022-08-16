// 4. Reply
const auth = require("./authentication.js");
const logger = require("../common/logger.js");

// Reply @{username} result_text to id
exports.reply_result = async (input, result_text) => {
  const client = auth.init_twitter_api();
  const params = {
    status: result_text,
    in_reply_to_status_id: input.id,
  };
  logger.info(`Response: ${params.status}`);

  // Reply
  await client.post("statuses/update", params).catch(
    error => { logger.error(error); }
  );
};

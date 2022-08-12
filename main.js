const logger = require("./common/logger.js");

const envLoad = require("dotenv").config();
if (envLoad.error) {
    logger.error("failed to load env file");
}

const twitter = require("./twitter");
const debater = require("./debater");

twitter.startStream(debater.response);
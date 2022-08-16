const logger = require("./common/logger.js");

const envLoad = require("dotenv").config();
if (envLoad.error) {
    logger.error("failed to load env file");
}

const twitter = require("./twitter");
const debater = require("./debater");

let waitTimes = 0;
const wait = (min) => {
    waitTimes++;
    return new Promise(resolve => setTimeout(resolve, min * 60 * 1000));
};

const main = async () => {
    try {
        await twitter.startStream(debater.response);
    } catch (err) {
        if (err.code === 429) {
            if (waitTimes < 8) {
                logger.info(`Waiting 15 minutes for reconect ...`);
                await wait(15);
                logger.info(`Reconnecting(${waitTimes}/8) ...`);
                main();
            } else {
                logger.error("Connection failed after 2 hours of waiting.");
            }
        } else {
            logger.error(err);
        }
    }
};

main();
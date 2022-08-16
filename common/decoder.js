const he = require("he");
const logger = require("./logger.js");

const decoder = {};

decoder.decodeUnicode = (text) => {
    let decoded;
    try {
        decoded = decodeURIComponent(JSON.parse(`"${text}"`));
    } catch (e) {
        decoded = text;
        logger.warn(`(Decode Error): text=${text}`);
    }

    return decoded;
};

decoder.deCodeSymbol = (text) => {
    return he.decode(text);
}

decoder.decodeAll = (text) => {
    let decoded = text;
    decoded = decoder.decodeUnicode(decoded);
    decoded = decoder.deCodeSymbol(decoded);

    logger.debug(`(Decode Log): Target=${text} , Sanitized=${decoded}`);
    return decoded;
};

module.exports = decoder;
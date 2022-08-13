const he = require("he");
const logger = require("./logger.js");

const decoder = {};

let target = "";

decoder.decodeUnicode = () => {
    const raw = target;
    try {
        target = decodeURIComponent(JSON.parse(`"${raw}"`));
    } catch (e) {
        target = raw;
        logger.error(`(Decode Error): raw=${raw}`);
    }

    return decoder;
};

decoder.deCodeSymbol = () => {
    target = he.decode(target);

    return decoder;
}

decoder.decodeAll = (text) => {
    target = text;
    decoder.decodeUnicode().deCodeSymbol();
    const decoded = target;
    target = "";
    logger.debug(`(Decode Log): Target=${text} , Sanitized=${decoded}`);
    return decoded;
};

module.exports = decoder;
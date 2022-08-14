const emojiRegexCreator = require('emoji-regex');
const logger = require("./logger.js");

const sanitizer = {};

let target = "";

sanitizer.removeEmoji = () =>{
    const emojiRegex = emojiRegexCreator();
    target = target.replace(emojiRegex,"");

    return sanitizer;
};

sanitizer.removeMention = () =>{
    const regex_mention = /@+([a-zA-Z0-9亜-熙ぁ-んァ-ヶー-龥朗-鶴.\-_]+)/g;
    target = target.replace(regex_mention,"");

    return sanitizer;
};

sanitizer.removeHashtag = () =>{
    target = target.replace(/#/g,"");

    return sanitizer;
};

sanitizer.removeLines = () =>{
    target = target.replace(/(\r\n|\n|\r)/gm,"");

    return sanitizer;
};

sanitizer.removeFiles = () =>{
    const regex_url = /(?:https?\:\/\/|www\.)[^\s]+/g;
    target = target.replace(regex_url,"");

    return sanitizer;
};

sanitizer.removeAll = (text) =>{
    target = text;
    sanitizer.removeEmoji().removeMention().removeHashtag().removeLines().removeFiles();
    const sanitized = target;
    target = "";
    logger.debug(`(Sanitize Log): Target=${text} , Sanitized=${sanitized}`);
    return sanitized;
};

module.exports = sanitizer;
const emojiRegexCreator = require('emoji-regex');
const logger = require("./logger.js");

const sanitizer = {};

sanitizer.removeEmoji = (text) =>{
    const emojiRegex = emojiRegexCreator();
    return text.replace(emojiRegex,"");
};

sanitizer.removeMention = (text) =>{
    const regex_mention = /@+([a-zA-Z0-9亜-熙ぁ-んァ-ヶー-龥朗-鶴.\-_]+)/g;
    return text.replace(regex_mention,"");
};

sanitizer.removeHashtag = (text) =>{
    return text.replace(/#/g,"");
};

sanitizer.removeLines = (text) =>{
    return text.replace(/(\r\n|\n|\r)/gm,"");
};

sanitizer.removeFiles = (text) =>{
    const regex_url = /(?:https?\:\/\/|www\.)[^\s]+/g;
    return text.replace(regex_url,"");
};

sanitizer.removeAll = (text) =>{
    let sanitized = text;
    sanitized = sanitizer.removeEmoji(sanitized);
    sanitized = sanitizer.removeMention(sanitized);
    sanitized = sanitizer.removeHashtag(sanitized);
    sanitized = sanitizer.removeLines(sanitized);
    sanitized = sanitizer.removeFiles(sanitized); 

    logger.debug(`(Sanitize Log): Target=${text} , Sanitized=${sanitized}`);
    return sanitized;
};

module.exports = sanitizer;
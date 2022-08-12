const emojiRegexCreator = require('emoji-regex');
const logger = require("./logger.js");

const sanitizer = {};

let target = "";

sanitizer.removeEmoji = () =>{
    const emojiRegex = emojiRegexCreator();
    target = sanitizer.text.replace(emojiRegex,"");

    return sanitizer;
} ;

sanitizer.removeHashtag = () =>{
    target = sanitizer.text.replace(/#/g,"");

    return sanitizer;
}

sanitizer.removeLines = () =>{
    target = sanitizer.text.replace(/(\r\n|\n|\r)/gm,"");

    return sanitizer;
}

sanitizer.removeAll = (text) =>{
    target = text;
    sanitizer.removeEmoji().removeHashtag().removeLines();
    const sanitized = target;
    target = "";
    logger.debug(`(Sanitize Log): Target=${text} , Sanitized=${sanitized}`);
    return sanitized;
}

module.exports = sanitizer;
const debater = require("./debater.js");
const search = require("../search");
const sanitizer = require("../common/sanitizer.js");
const config = require("./config.json");
const logger = require("../common/logger.js");

const logic = {};

const getProConScore = async (keywords, result) => {
    const texts = result.map(v => v.snippet ?? v.description);
    const scores = await debater.proCon(keywords, texts);
    return scores;
};

const getRelevantScore = async (keywords, result) => {
    const texts = result.map(v => v.snippet ?? v.description);
    const scores = await debater.claimDetection(keywords, texts);
    return scores;
};

const getStrongScores = (result, mode) => {
    const bookPro = result.book.reduce((a, b) => a.score > b.score ? a : b);
    const bookCon = result.book.reduce((a, b) => a.score < b.score ? a : b);
    const newsPro = result.news.reduce((a, b) => a.score > b.score ? a : b);
    const newsCon = result.news.reduce((a, b) => a.score < b.score ? a : b);

    if (mode === "POS ONLY") return [bookPro, newsPro];
    else if (mode === "NEG ONLY") return [bookCon, newsCon];
    else return [bookPro, bookCon, newsPro, newsCon];
};

const determineStance = (result, mode) => {
    const strongScores = getStrongScores(result, mode);
    const TH = config.threshold;
    const hasStrong = strongScores.some(v => v.relevant >= TH);

    if (!hasStrong) return { stance: "Neutral", lit: null };

    const BIAS = config.negativeBias;
    const strongest = strongScores.reduce((a, b) => {
        const scoreA = a.score > 0 ? a.score : Math.abs(a.score) * BIAS;
        const scoreB = b.score > 0 ? b.score : Math.abs(b.score) * BIAS;
        return (scoreA > scoreB) ? a : b;
    });

    return {
        stance: strongest.score > 0 ? "Positive" : "Negative",
        lit: strongest
    };
};

const shorten = (str, allLength, usedLength) => {
    const remain = allLength - usedLength;
    if (str.length <= remain) return str;

    const last = " ...";
    const shortened = str.substr(0, remain - last.length);
    return shortened + last;
};

const getMessage = (determined, mode, mention) => {
    const stance = determined.stance;
    const lit = determined.lit;

    if (stance === "Neutral") {
        const FAIL_MSG = config.message.response.failed;
        const STANCE_FAIL_MSG = config.message.response.failed_stance_specified;
        const neutralMsg = FAIL_MSG + (mode === "ALL") ? "" : STANCE_FAIL_MSG;
        return neutralMsg;
    }

    logger.info(`Found type:${lit.type} link:${lit.link}`);
    const statement = (lit.type === "book") ? lit.snippet : lit.description;
    // mention+"Found"+link+line
    const shortened = shorten(statement, 280, `${mention}\nFound:`.length + 23 + 1);
    return `${mention}\nFound:${lit.link}\n${shortened}`;
};

logic.response = async (input) => {
    const target = input.target_text;
    const request = input.request_text;

    // cut out claim
    const sanitizedTarget = sanitizer.removeAll(target);
    const claim = await debater.claimBoundaries(sanitizedTarget);

    // keyword extraction and search
    const keywords = await debater.termWikifier(claim);
    const searchResult = await search.search(keywords);

    // get pros/cons score and relevant score
    const scores = await Promise.all([
        getProConScore(sanitizedTarget, searchResult.book),
        getProConScore(sanitizedTarget, searchResult.news),
        getRelevantScore(sanitizedTarget, searchResult.book),
        getRelevantScore(sanitizedTarget, searchResult.book),
    ]);
    searchResult.book.forEach((v, index) => {
        v.score = scores[0][index] * scores[2][index];
        v.relevant = scores[2][index];
    });
    searchResult.news.forEach((v, index) => {
        v.score = scores[1][index] * scores[3][index];
        v.relevant = scores[3][index];
    });

    const sanitizedRequest = sanitizer.removeAll(request);
    let mode = "ALL";
    const POS_ONLY = config.message.request.positive;
    const NEG_ONLY = config.message.request.negative;
    if (sanitizedRequest.includes(POS_ONLY)) mode = "POS ONLY";
    else if (sanitizedRequest.includes(NEG_ONLY)) mode = "NEG ONLY";

    // determine stance from search result
    const determined = determineStance(searchResult, mode);
    // form response message
    const mention = `@${input.username}`;
    const message = getMessage(determined, mode, mention);
    return message;
};

module.exports = logic;
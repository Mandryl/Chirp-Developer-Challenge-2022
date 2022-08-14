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
    const hasStrong = strongScores.some(v => Math.abs(v.score) >= TH);

    if (!hasStrong) return { stance: "Neutral", lit: null };

    const BIAS = config.positiveBias;
    const strongest = strongScores.reduce((a, b) => {
        const scoreA = a.score > 0 ? a.score - BIAS : Math.abs(a.score);
        const scoreB = b.score > 0 ? b.score - BIAS : Math.abs(b.score);
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

const getMessage = (determined, mode) => {
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
    // space after mention+"Found"+link+line
    return `Found:${lit.link}\n${shorten(statement, 280, 1 + "Founnd:".length + 23 + 1)}`;
};

logic.response = async (input) => {
    const target = input.target_text;
    const request = input.request_text;

    // detect claim
    const sanitizedTarget = sanitizer.removeAll(target);
    const claim = await debater.claimBoundaries(sanitizedTarget);

    // keyword extraction and search
    const keywords = await debater.termWikifier(claim);
    const searchResult = await search.search(keywords);

    // get news pros/cons score
    const proConScore = await Promise.all([
        getProConScore(claim, searchResult.book),
        getProConScore(claim, searchResult.news),
    ]);
    searchResult.book.forEach((v, index) => {
        v.score = proConScore[0][index];
    });
    searchResult.news.forEach((v, index) => {
        v.score = proConScore[1][index];
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
    const message = getMessage(determined, mode);
    return message;
};

module.exports = logic;
const axios = require("axios").default;
const headers = {
    'Content-Type': 'application/json',
    'apiKey': process.env.DEBATER_API_KEY
};

const logger = require("../common/logger.js");

const debater = {};
debater.claimBoundaries = async (sentence) => {
    const data = {
        "sentences": [sentence]
    };

    const response = await axios.post(
        'https://claim-boundaries.debater.res.ibm.com/score/',
        data,
        { headers: headers }
    ).catch(error => {
        logger.error(`Status:${error.response.status}:${error.message}`);
    });

    if (response.status !== 200) {
        return sentence;
    }

    const boundary = response.data[0];
    if (boundary[1] - boundary[0] > 0) {
        return sentence.substring(boundary[0], boundary[1]);
    } else {
        return sentence;
    }
};

debater.termWikifier = async (text) => {
    const data = {
        "config": "",
        "contextTitles": [],
        "contextText": "",
        "textsToAnnotate": [
            { "text": text, "contextTitles": [] }
        ]
    };

    const response = await axios.post(
        'https://tw.debater.res.ibm.com/TermWikifier/v2/annotate/',
        data,
        { headers: headers }
    ).catch(error => {
        logger.error(`Status:${error.response.status}:${error.message}`);
    });

    if (response.status !== 200) {
        return [];
    }

    const wfResult = response.data.annotations[0];
    const inlinkSet = new Set();
    const keywords = wfResult.filter(v => {
        if (v.inlinks) {
            if (inlinkSet.has(v.inlinks)) return false;
            inlinkSet.add(v.inlinks);
            return true;
        }
        return true;
    }).map(v => v.cleanText.replace(/"/g,""));

    return keywords;
};

debater.proCon = async (topic, sentences) => {
    const pairs = sentences.map(v => [v, topic]);

    const data = {
        sentence_topic_pairs: pairs,
    };

    const response = await axios.post(
        'https://pro-con.debater.res.ibm.com/score/',
        data,
        { headers: headers }
    ).catch(error => {
        logger.error(`Status:${error.response.status}:${error.message}`);
    });

    if (response.status !== 200) {
        return [];
    }

    const proconResult = response.data;
    const scores = proconResult.map(v => (v.pro - v.con));

    return scores;
}

module.exports = debater;
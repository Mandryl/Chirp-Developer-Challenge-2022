const { NewsSearchClient } = require("@azure/cognitiveservices-newssearch");
const { CognitiveServicesCredentials } = require("@azure/ms-rest-azure-js");
const logger = require("../common/logger.js");

const news = {};

news.search = async (keywords) => {
    if(!(keywords.length)) return [];

    const newsSearchKey = process.env.BING_API_KEY;
    const cognitiveServiceCredentials = new CognitiveServicesCredentials(
        newsSearchKey
    );
    const client = new NewsSearchClient(cognitiveServiceCredentials);
    client.endpoint = "https://api.bing.microsoft.com/v7.0/news/search";
    const query = keywords.join(" ");
    const options = {
        count: 100,
        market: "en-us"
    };
    const bingResult = await client.news.search(query, options).catch(error =>{
        logger.error(JSON.stringify(error));
        return null;
    });
    const newsResult = bingResult ? bingResult.value : [];
    const result = newsResult.map(v => {
        return {
            type: "news",
            title: v.name,
            link: v.url,
            provider: v.provider[0].name,
            description: v.description
        };
    });

    return result;
};

module.exports = news;
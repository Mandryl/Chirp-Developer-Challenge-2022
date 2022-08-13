const book = require("./book.js");
const news = require("./news.js");

const logic = {};

logic.search = async (keywords) =>{
    const results = await Promise.all([
        book.search(keywords),
        news.search(keywords)
    ]);

    return {
        book: results[0],
        news: results[1]
    };
};

module.exports = logic;
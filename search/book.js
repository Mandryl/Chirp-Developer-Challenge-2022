const axios = require("axios").default;
const decoder = require("../common/decoder.js");
const logger = require("../common/logger.js");

const books = {};

// categories wich remove from search result
const NG_CAT = ["Drama","Fiction"];

books.search = async (keywords) => {
    if (!(keywords.length)) return [];

    const query = keywords.join("+").replace(/\s+/g, "+");

    const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&printType=books&langRestrict=en&maxResults=40`
    ).catch(error => {
        logger.error(`Status:${error.response.status}:${error.message}`);
    });
    if (response.status !== 200) return [];

    const bookResult = response.data.items ?? [];
    const result = bookResult.filter(v=>{
        const categories = v.volumeInfo.categories ?? [];
        return !(categories.some(e => NG_CAT.includes(e)));
    }).filter(v =>{
        const snippet = v.searchInfo ? v.searchInfo.textSnippet : "";
        return snippet && snippet !== "";
    }).map(v => {
        const snippetRaw = v.searchInfo.textSnippet;
        let snippet = decoder.decodeAll(snippetRaw);
        // remove html tag
        snippet = snippet.replace(/<\/?[^>]+(>|$)/g, "");

        return {
            type: "book",
            title: v.volumeInfo.title,
            author: v.volumeInfo.authors ?? [],
            link: v.volumeInfo.infoLink ?? "",
            snippet: snippet
        }
    });

    return result;
}

module.exports = books;
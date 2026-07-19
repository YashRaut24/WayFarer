const cheerio = require("cheerio");

async function summarizeArticle(url){
    const response = await fetch (url, {
        headers: { "User-Agent" : "Mozilla/5.0 (Wayfarer bot)" },
    });

    if(!response.ok){
        throw new Error(`Failed to fetch article (status ${response.status})`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, aside").remove();

    const paragraphs = [];
    $("p").each((i,el) => {
        const text = $(el).text().trim();
        if(text.length > 40) paragraphs.push(text);
    });

    if(paragraphs.length === 0){
        throw new Error("Could not extract readable content from this page");
    }

    const title = $("title").text().trim();
    let summary = paragraphs.slice(0,5).join(" ");
    if( summary.length > 1200) summary = summary.slice(0,1200) + "...";

    return {title, url, summary, paragraphCount: paragraphs.length};
}

module.exports = { summarizeArticle };
async function fetchLatestHeadlines(topic){
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if(data.status != "ok") {
        throw new Error(data.message || "Unknown error from NewsAPI");
    }

    return data.articles.slice(0,5).map((articles) => ({
        title: articles.title,
        source: articles.source.name,
        url: articles.url,
        publishedAt: articles.publishedAt,
    }));
}

module.exports = { fetchLatestHeadlines };
async function fetchLatestHeadlines(topic) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "ok") {
    throw new Error(data.message || "Unknown error from NewsAPI");
  }

  return data.articles.slice(0, 5).map((article) => ({
    title: article.title,
    source: article.source.name,
    url: article.url,
    publishedAt: article.publishedAt,
  }));
}

module.exports = { fetchLatestHeadlines };
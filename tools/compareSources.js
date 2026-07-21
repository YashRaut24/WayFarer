async function compareSources(topic) {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=relevancy&language=en&pageSize=30&apiKey=${process.env.NEWS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "ok") {
    throw new Error(data.message || "Unknown error from NewsAPI");
  }

  const seenSources = new Set();
  const comparison = [];

  for (const article of data.articles) {
    const sourceName = article.source.name;
    if (seenSources.has(sourceName)) continue;
    seenSources.add(sourceName);

    comparison.push({
      source: sourceName,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
    });

    if (comparison.length >= 5) break;
  }

  if (comparison.length === 0) {
    throw new Error(`No coverage found for "${topic}"`);
  }

  return comparison;
}

module.exports = { compareSources };
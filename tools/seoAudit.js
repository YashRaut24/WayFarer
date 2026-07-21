const cheerio = require("cheerio");

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

async function auditSeo(targetUrl) {
  targetUrl = normalizeUrl(targetUrl);

  const response = await fetch(targetUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Wayfarer bot)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page (status ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const issues = [];
  const passed = [];

  const title = $("title").text().trim();
  if (!title) {
    issues.push({ severity: "high", message: "Missing <title> tag" });
  } else if (title.length > 60) {
    issues.push({ severity: "low", message: `Title is ${title.length} characters, longer than the recommended 60` });
  } else {
    passed.push("Title tag present and reasonable length");
  }

  const metaDescription = $('meta[name="description"]').attr("content");
  if (!metaDescription) {
    issues.push({ severity: "high", message: "Missing meta description" });
  } else if (metaDescription.length > 160) {
    issues.push({ severity: "low", message: `Meta description is ${metaDescription.length} characters, longer than the recommended 160` });
  } else {
    passed.push("Meta description present and reasonable length");
  }

  const h1Count = $("h1").length;
  if (h1Count === 0) {
    issues.push({ severity: "medium", message: "No <h1> tag found" });
  } else if (h1Count > 1) {
    issues.push({ severity: "medium", message: `${h1Count} <h1> tags found — should typically have exactly one` });
  } else {
    passed.push("Exactly one <h1> tag");
  }

  const images = $("img");
  let missingAlt = 0;
  images.each((i, el) => {
    const alt = $(el).attr("alt");
    if (!alt || !alt.trim()) missingAlt++;
  });
  if (missingAlt > 0) {
    issues.push({ severity: "medium", message: `${missingAlt} of ${images.length} images missing alt text` });
  } else if (images.length > 0) {
    passed.push("All images have alt text");
  }

  const viewport = $('meta[name="viewport"]').attr("content");
  if (!viewport) {
    issues.push({ severity: "high", message: "Missing viewport meta tag (not mobile-friendly)" });
  } else {
    passed.push("Viewport meta tag present");
  }

  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical) {
    issues.push({ severity: "low", message: "Missing canonical link tag" });
  } else {
    passed.push("Canonical tag present");
  }

  return { url: targetUrl, title, issues, passed, score: passed.length - issues.length };
}

module.exports = { auditSeo };
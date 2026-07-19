const cheerio = require("cheerio");
const PriceCheck = require("../api/models/PriceCheck");

function normalizeUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

function extractPrice($) {
  const metaPrice = $('meta[property="product:price:amount"]').attr("content");
  if (metaPrice) return parseFloat(metaPrice);

  const itemProp = $('[itemprop="price"]').attr("content") || $('[itemprop="price"]').text();
  if (itemProp) return parseFloat(itemProp.replace(/[^0-9.]/g, ""));

  const bodyText = $("body").text();
  const match = bodyText.match(/[$₹£€]\s?[\d,]+\.?\d*/);
  if (match) return parseFloat(match[0].replace(/[^0-9.]/g, ""));

  return null;
}

async function trackPrice(url) {
  url = normalizeUrl(url);
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Wayfarer bot)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page (status ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const price = extractPrice($);

  if (price === null) {
    throw new Error("Could not find a price on this page");
  }

  const previous = await PriceCheck.findOne({ url }).sort({ checkedAt: -1 });

  await PriceCheck.create({ url, price });

  let priceDropped = false;
  let previousPrice = null;
  let difference = null;

  if (previous) {
    previousPrice = previous.price;
    difference = previous.price - price;
    priceDropped = difference > 0;
  }

  return { url, price, previousPrice, priceDropped, difference };
}

module.exports = { trackPrice };
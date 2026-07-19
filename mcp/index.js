const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { summarizeArticle } = require("../tools/summarize");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { trackPrice } = require("../tools/priceTracker");
const { checkWebsiteHealth } = require("../tools/healthCheck");
const { fetchLatestHeadlines } = require("../tools/headlines");

const server = new Server(
  { name: "wayfarer", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_latest_headlines",
        description: "Fetch the latest news headlines for a given topic",
        inputSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "The topic to search headlines for, e.g. 'technology' or 'climate'",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "summarize_article",
        description: "Fetch an article by URL and return a readable summary",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The full URL of the article to summarize" },
          },
          required: ["url"],
        },
      },
      {
        name: "track_price",
        description: "Scrape a product page's price and compare it to the last recorded price for that URL",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The product page URL to check" },
          },
          required: ["url"],
        },
      },
      {
        name: "check_website_health",
        description: "Check if a website is up, its response time, and SSL certificate status",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The website URL to check, including https://" },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "fetch_latest_headlines") {
    try {
      const headlines = await fetchLatestHeadlines(args.topic);
      const text = headlines
        .map((h, i) => `${i + 1}. ${h.title} (${h.source})`)
        .join("\n");

      return { content: [{ type: "text", text: text || `No headlines found for "${args.topic}".` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error fetching headlines: ${err.message}` }] };
    }
  }

  if (name === "summarize_article") {
    try {
      const result = await summarizeArticle(args.url);
      return {
        content: [{ type: "text", text: `${result.title}\n\n${result.summary}` }],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error summarizing article: ${err.message}` }] };
    }
  }

  if (name === "track_price") {
  try {
    const result = await trackPrice(args.url);
    let text = `Current price: ${result.price}`;
    if (result.previousPrice !== null) {
      text += result.priceDropped
        ? `\nPrice dropped by ${result.difference} (was ${result.previousPrice})`
        : `\nNo drop — previous price was ${result.previousPrice}`;
      } else {
        text += "\nThis is the first recorded check for this URL.";
      }
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error tracking price: ${err.message}` }] };
    }
  }

  if (name === "check_website_health") {
    try {
      const result = await checkWebsiteHealth(args.url);
      const text = `Status: ${result.status} (${result.ok ? "OK" : "not OK"})\nResponse time: ${result.responseTimeMs}ms\nSSL valid: ${result.sslValid}${result.sslExpiresAt ? `\nSSL expires: ${result.sslExpiresAt}` : ""}`;
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error checking website: ${err.message}` }] };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
server.connect(transport);
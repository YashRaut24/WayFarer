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
const { auditSeo } = require("../tools/seoAudit");
const { compareSources } = require("../tools/compareSources");

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
      {
        name: "audit_seo",
        description: "Scan a webpage for common SEO issues: missing meta tags, alt text, heading structure",
        inputSchema: {
          type: "object",
          properties: { url: { type: "string", description: "The page URL to audit" } },
          required: ["url"],
        },
      },
      {
        name: "compare_sources",
        description: "Fetch how different news outlets are covering the same topic, side by side",
        inputSchema: {
          type: "object",
          properties: { topic: { type: "string", description: "The topic to compare coverage of" } },
          required: ["topic"],
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

  if (name === "audit_seo") {
    try {
      const result = await auditSeo(args.url);
      const issuesText = result.issues.map((i) => `[${i.severity}] ${i.message}`).join("\n") || "No issues found";
      return { content: [{ type: "text", text: `SEO Score: ${result.score}\n\n${issuesText}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error auditing page: ${err.message}` }] };
    }
  }

  if (name === "compare_sources") {
    try {
      const results = await compareSources(args.topic);
      const text = results.map((r) => `${r.source}: ${r.title}`).join("\n\n");
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error comparing sources: ${err.message}` }] };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
server.connect(transport);
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { summarizeArticle } = require("../tools/summarize");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
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

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
server.connect(transport);
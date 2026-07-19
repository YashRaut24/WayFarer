const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
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

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
server.connect(transport);
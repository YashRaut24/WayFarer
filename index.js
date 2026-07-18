const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

require("dotenv").config({ quiet: true });

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
        const { topic } = args;

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "ok") {
            return {
            content: [
                {
                type: "text",
                text: `Error fetching headlines: ${data.message || "Unknown error"}`,
                },
            ],
            };
        }

        const headlines = data.articles
            .slice(0, 5)
            .map((article, i) => `${i + 1}. ${article.title} (${article.source.name})`)
            .join("\n");

        return {
            content: [
            {
                type: "text",
                text: headlines || `No headlines found for "${topic}".`,
            },
            ],
        };
        }

    throw new Error(`Unknown tool: ${name}`);
    });

const transport = new StdioServerTransport();
server.connect(transport);
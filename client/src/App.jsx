import { useState, useEffect } from "react";
import { Tabs } from "./components/Tabs";
import { SearchBar } from "./components/SearchBar";
import { HeadlineList } from "./components/HeadlineList";
import { HistoryList } from "./components/HistoryList";
import { PriceTracker } from "./components/PriceTracker";
import { HealthChecker } from "./components/HealthChecker";
import { SeoAuditor } from "./components/SeoAuditor";
import { SourceComparison } from "./components/SourceComparison";
import "./styles/shared.css";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TOOL_META = {
  news: {
    title: "News & Headlines",
    description: "Pull today's headlines on any topic, then summarize any article in one click.",
  },
  price: {
    title: "Price Tracker",
    description: "Check a product page's current price and see how it compares to your last check.",
  },
  health: {
    title: "Health Checker",
    description: "Confirm a website is online and its SSL certificate is valid.",
  },
  seo: {
    title: "SEO Auditor",
    description: "Scan a page for common SEO issues, from missing meta tags to heading structure.",
  },
  compare: {
    title: "Compare Sources",
    description: "See how different outlets are covering the same topic, side by side.",
  },
};

function getInitialTheme() {
  const saved = localStorage.getItem("wayfarer-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function App() {
  const [activeTab, setActiveTab] = useState("news");
  const [topic, setTopic] = useState("");
  const [headlines, setHeadlines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wayfarer-theme", theme);
  }, [theme]);

  async function loadHistory() {
    const res = await fetch(`${API_URL}/api/history`);
    const data = await res.json();
    setHistory(data.logs);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleFetch() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/fetch-headlines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setHeadlines(data.headlines);
      loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const meta = TOOL_META[activeTab];

  return (
    <div className="app">
      <div className={historyOpen ? "app-shell history-open" : "app-shell"}>
        <aside className="rail">
          <div className="rail-brand">
            <h1>Wayfarer</h1>
            <span className="tagline">Fetch the news, from anywhere you're building.</span>
          </div>

          <Tabs active={activeTab} onChange={setActiveTab} />

          <div className="rail-footer">
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="10" cy="10" r="4" />
                  <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M16.5 12.3A6.8 6.8 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8Z" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <button
              className="rail-history-toggle"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-expanded={historyOpen}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 6.2V10l2.6 1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Recent activity</span>
              {history.length > 0 && <span className="count">{history.length}</span>}
            </button>
          </div>
        </aside>

        <main className="workspace">
          <div className="workspace-header">
            <h2>{meta.title}</h2>
            <p>{meta.description}</p>
          </div>

          {activeTab === "news" && (
            <>
              <SearchBar topic={topic} onTopicChange={setTopic} onSubmit={handleFetch} loading={loading} />
              {error && <p className="error-text">{error}</p>}
              <HeadlineList headlines={headlines} loading={loading} />
            </>
          )}

          {activeTab === "price" && <PriceTracker onLogged={loadHistory} />}

          {activeTab === "health" && <HealthChecker onLogged={loadHistory} />}

          {activeTab === "seo" && <SeoAuditor onLogged={loadHistory} />}

          {activeTab === "compare" && <SourceComparison onLogged={loadHistory} />}
        </main>

        <div
          className={historyOpen ? "history-backdrop open" : "history-backdrop"}
          onClick={() => setHistoryOpen(false)}
        />

        <aside className={historyOpen ? "history-panel open" : "history-panel"}>
          <div className="history-panel-head">
            <h2>Recent activity</h2>
            <button className="history-panel-close" onClick={() => setHistoryOpen(false)} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>
          <HistoryList history={history} />
        </aside>
      </div>
    </div>
  );
}

export default App;
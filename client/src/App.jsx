import { useState, useEffect } from "react";
import { Tabs } from "./components/Tabs";
import { SearchBar } from "./components/SearchBar";
import { HeadlineList } from "./components/HeadlineList";
import { HistoryList } from "./components/HistoryList";
import { PriceTracker } from "./components/PriceTracker";
import { HealthChecker } from "./components/HealthChecker";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [activeTab, setActiveTab] = useState("news");
  const [topic, setTopic] = useState("");
  const [headlines, setHeadlines] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Wayfarer</h1>
        <p className="tagline">Fetch the news, from anywhere you're building.</p>
      </header>

      <Tabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "news" && (
        <>
          <SearchBar topic={topic} onTopicChange={setTopic} onSubmit={handleFetch} loading={loading} />
          {error && <p className="error">{error}</p>}
          <HeadlineList headlines={headlines} />
        </>
      )}

      {activeTab === "price" && <PriceTracker onLogged={loadHistory} />}

      {activeTab === "health" && <HealthChecker onLogged={loadHistory} />}

      <section className="history-section">
        <h2>Recent activity</h2>
        <HistoryList history={history} />
      </section>
    </div>
  );
}

export default App;

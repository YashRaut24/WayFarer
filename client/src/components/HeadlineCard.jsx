import { useState } from "react";
import "./HeadlineCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function HeadlineCard({ headline }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSummarize(e) {
    e.preventDefault(); // stop the card's <a> link from navigating away
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: headline.url }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not summarize this article");

      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="headline-card">
      <div className="headline-source">{headline.source}</div>
      <a href={headline.url} target="_blank" rel="noreferrer" className="headline-title">
        {headline.title}
      </a>

      <button className="summarize-btn" onClick={handleSummarize} disabled={loading}>
        {loading ? "Summarizing..." : summary ? "Re-summarize" : "Summarize"}
      </button>

      {error && <p className="summarize-error">{error}</p>}
      {summary && <p className="summary-text">{summary}</p>}
    </div>
  );
}
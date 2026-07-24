import { useState } from "react";
import "./SourceComparison.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function SourceComparison({ onLogged }) {
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCompare() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(`${API_URL}/api/compare-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not compare sources");

      setResults(data.comparison);
      onLogged();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          className="input"
          placeholder="Topic to compare across sources"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCompare()}
        />
        <button className="btn btn-primary" onClick={handleCompare} disabled={loading}>
          {loading ? "Comparing..." : "Compare sources"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {results.length > 0 && (
        <div className="comparison-grid">
          {results.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer" className="comparison-card">
              <div className="comparison-source">{item.source}</div>
              <div className="comparison-title">{item.title}</div>
              {item.description && <div className="comparison-desc">{item.description}</div>}
            </a>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && !error && (
        <div className="empty-state">
          <svg className="empty-state-icon" width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="3" y="4" width="6" height="12" rx="1" />
            <rect x="11" y="4" width="6" height="8" rx="1" />
          </svg>
          <p>Enter a topic to see how different outlets are covering it, side by side.</p>
        </div>
      )}
    </div>
  );
}
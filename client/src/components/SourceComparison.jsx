import { useState } from "react";
import "./SourceComparison.css";

const API_URL = "http://localhost:5000";

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
    <div className="tool-panel">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Topic to compare across sources"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCompare()}
        />
        <button onClick={handleCompare} disabled={loading}>
          {loading ? "Comparing..." : "Compare sources"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="comparison-grid">
        {results.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noreferrer" className="comparison-card">
            <div className="comparison-source">{item.source}</div>
            <div className="comparison-title">{item.title}</div>
            {item.description && <div className="comparison-desc">{item.description}</div>}
          </a>
        ))}
      </div>
    </div>
  );
}
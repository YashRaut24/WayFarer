import { useState } from "react";
import "./SeoAuditor.css";

const API_URL = "http://localhost:5000";

export function SeoAuditor({ onLogged }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAudit() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/audit-seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not audit this page");

      setResult(data);
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
          placeholder="Page URL to audit"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAudit()}
        />
        <button onClick={handleAudit} disabled={loading}>
          {loading ? "Auditing..." : "Audit page"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="seo-result">
          <div className="seo-score">Score: {result.score}</div>

          {result.issues.length > 0 && (
            <div className="seo-issues">
              <h3>Issues</h3>
              {result.issues.map((issue, i) => (
                <div key={i} className={`seo-issue seo-${issue.severity}`}>
                  <span className="seo-severity">{issue.severity}</span> {issue.message}
                </div>
              ))}
            </div>
          )}

          {result.passed.length > 0 && (
            <div className="seo-passed">
              <h3>Passed</h3>
              {result.passed.map((item, i) => (
                <div key={i} className="seo-pass-item">✓ {item}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
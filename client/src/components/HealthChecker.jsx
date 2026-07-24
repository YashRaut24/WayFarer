import { useState } from "react";
import "./HealthChecker.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function HealthChecker({ onLogged }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCheck() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/check-health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check this site");

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
          className="input"
          placeholder="Website URL, including https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        />
        <button className="btn btn-primary" onClick={handleCheck} disabled={loading}>
          {loading ? "Checking..." : "Check health"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="result-card">
          <div className={result.ok ? "health-status health-status-ok" : "health-status health-status-bad"}>
            <span className="health-status-dot" />
            {result.status} — {result.ok ? "Online" : "Issue detected"}
          </div>
          <div className="health-detail">Response time: {result.responseTimeMs}ms</div>
          <div className="health-detail">
            SSL: {result.sslValid === null ? "N/A (not HTTPS)" : result.sslValid ? "Valid" : "Invalid"}
            {result.sslExpiresAt && ` — expires ${result.sslExpiresAt}`}
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="empty-state">
          <svg className="empty-state-icon" width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 10.5h3l1.6-4 2.4 7 1.6-3h5.4" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <p>Enter a URL to check whether it's online and its SSL certificate is valid.</p>
        </div>
      )}
    </div>
  );
}
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
          placeholder="Website URL, including https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        />
        <button onClick={handleCheck} disabled={loading}>
          {loading ? "Checking..." : "Check health"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="health-result">
          <div className={result.ok ? "health-status-ok" : "health-status-bad"}>
            {result.status} — {result.ok ? "Online" : "Issue detected"}
          </div>
          <div className="health-detail">Response time: {result.responseTimeMs}ms</div>
          <div className="health-detail">
            SSL: {result.sslValid === null ? "N/A (not HTTPS)" : result.sslValid ? "Valid" : "Invalid"}
            {result.sslExpiresAt && ` — expires ${result.sslExpiresAt}`}
          </div>
        </div>
      )}
    </div>
  );
}
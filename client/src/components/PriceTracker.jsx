import { useState } from "react";
import "./PriceTracker.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function PriceTracker({ onLogged }) {
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
      const res = await fetch(`${API_URL}/api/track-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not track this price");

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
          placeholder="Product page URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        />
        <button className="btn btn-primary" onClick={handleCheck} disabled={loading}>
          {loading ? "Checking..." : "Track price"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="result-card">
          <div className="price-current">{result.price}</div>
          {result.previousPrice !== null ? (
            <div className={result.priceDropped ? "price-drop" : "price-same"}>
              {result.priceDropped
                ? `Dropped ${result.difference} — was ${result.previousPrice}`
                : `No change — previous check was ${result.previousPrice}`}
            </div>
          ) : (
            <div className="price-first">First recorded check for this URL.</div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="empty-state">
          <svg className="empty-state-icon" width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M11 3.5H5.5A1.5 1.5 0 0 0 4 5v5.5L10.5 17l6-6L11 3.5Z" />
          </svg>
          <p>Paste a product page URL to record its current price.</p>
        </div>
      )}
    </div>
  );
}
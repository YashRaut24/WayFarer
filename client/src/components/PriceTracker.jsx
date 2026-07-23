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
          placeholder="Product page URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        />
        <button onClick={handleCheck} disabled={loading}>
          {loading ? "Checking..." : "Track price"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="price-result">
          <div className="price-current">Current price: {result.price}</div>
          {result.previousPrice !== null ? (
            <div className={result.priceDropped ? "price-drop" : "price-same"}>
              {result.priceDropped
                ? `Price dropped by ${result.difference} (was ${result.previousPrice})`
                : `No drop — previous price was ${result.previousPrice}`}
            </div>
          ) : (
            <div className="price-first">First recorded check for this URL.</div>
          )}
        </div>
      )}
    </div>
  );
}
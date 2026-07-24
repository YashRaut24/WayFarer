import { useState, useRef, useEffect } from "react";
import "./HeadlineCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function HeadlineCard({ headline }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    if (summary && summaryRef.current) {
      setIsClamped(summaryRef.current.scrollHeight > summaryRef.current.clientHeight + 1);
    }
  }, [summary]);

  async function handleSummarize() {
    setLoading(true);
    setError(null);
    setExpanded(false);

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

  const contentVisible = loading || !!summary || !!error;

  return (
    <article className="headline-card">
      <div className="headline-head">
        <span className="headline-source">{headline.source}</span>
        <svg className="headline-link-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6.5 3.5H4a1 1 0 0 0-1 1V12a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V9.5" />
          <path d="M9.5 2.5H13v3.5" />
          <path d="M13 2.5 7.5 8" />
        </svg>
      </div>

      <a href={headline.url} target="_blank" rel="noreferrer" className="headline-title-link">
        <h3 className="headline-title">{headline.title}</h3>
      </a>

      <div className="headline-footer">
        <button className="btn btn-ghost" onClick={handleSummarize} disabled={loading}>
          {loading ? "Summarizing..." : summary ? "Re-summarize" : "Summarize"}
        </button>

        <div className={contentVisible ? "accordion open" : "accordion"}>
          <div>
            {loading && (
              <div className="summary-skeleton">
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            )}
            {!loading && error && <p className="summarize-error">{error}</p>}
            {!loading && summary && (
              <>
                <p ref={summaryRef} className={expanded ? "summary-text" : "summary-text clamped"}>
                  {summary}
                </p>
                {isClamped && (
                  <button className="summary-toggle" onClick={() => setExpanded((v) => !v)}>
                    {expanded ? "Read less" : "Read more"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
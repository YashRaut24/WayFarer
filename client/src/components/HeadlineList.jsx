import "./HeadlineList.css";
import { HeadlineCard } from "./HeadlineCard";

export function HeadlineList({ headlines, loading }) {
  if (loading && headlines.length === 0) {
    return (
      <div className="headline-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="headline-skeleton-card">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (headlines.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3" y="4" width="14" height="12" rx="1.2" />
          <line x1="6" y1="7.5" x2="14" y2="7.5" />
          <line x1="6" y1="10.5" x2="14" y2="10.5" />
        </svg>
        <p>Search a topic above to see today's headlines here.</p>
      </div>
    );
  }

  return (
    <div className="headline-grid">
      {headlines.map((h, i) => (
        <HeadlineCard key={i} headline={h} />
      ))}
    </div>
  );
}
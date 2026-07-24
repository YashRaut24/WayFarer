import "./Tabs.css";

const ICONS = {
  news: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="14" height="12" rx="1.2" />
      <line x1="6" y1="7.5" x2="14" y2="7.5" />
      <line x1="6" y1="10.5" x2="14" y2="10.5" />
      <line x1="6" y1="13.5" x2="11" y2="13.5" />
    </svg>
  ),
  price: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M11 3.5H5.5A1.5 1.5 0 0 0 4 5v5.5L10.5 17l6-6L11 3.5Z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  health: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 10.5h3l1.6-4 2.4 7 1.6-3h5.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  seo: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8.5" cy="8.5" r="5" />
      <line x1="12.3" y1="12.3" x2="17" y2="17" strokeLinecap="round" />
    </svg>
  ),
  compare: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="6" height="12" rx="1" />
      <rect x="11" y="4" width="6" height="8" rx="1" />
    </svg>
  ),
};

const TABS = [
  { id: "news", label: "News & Headlines" },
  { id: "price", label: "Price Tracker" },
  { id: "health", label: "Health Checker" },
  { id: "seo", label: "SEO Auditor" },
  { id: "compare", label: "Compare Sources" },
];

export function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" aria-label="Tools">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={active === tab.id ? "tab active" : "tab"}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          {ICONS[tab.id]}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
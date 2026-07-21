import "./Tabs.css";

export function Tabs({ active, onChange }) {
  const tabs = [
    { id: "news", label: "News & Headlines" },
    { id: "price", label: "Price Tracker" },
    { id: "health", label: "Health Checker" },
    { id: "seo", label: "SEO Auditor" },
    { id: "compare", label: "Compare Sources" },
  ];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={active === tab.id ? "tab active" : "tab"}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
import "./SearchBar.css";

export function SearchBar({ topic, onTopicChange, onSubmit, loading }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="input"
        placeholder="Enter a topic — technology, climate, sports..."
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      />
      <button className="btn btn-primary" onClick={onSubmit} disabled={loading}>
        {loading ? "Fetching..." : "Fetch headlines"}
      </button>
    </div>
  );
}
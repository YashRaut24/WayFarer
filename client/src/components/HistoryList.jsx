import "./HistoryList.css";

export function HistoryList({ history }) {
  if (!history || history.length === 0) {
    return <p className="history-empty">Nothing logged yet — use a tool to see it appear here.</p>;
  }

  return (
    <div className="history-list">
      {history.map((log) => (
        <div key={log._id} className="history-row">
          <span className="history-tool">{log.tool}</span>
          <span className="history-time">
            {new Date(log.createdAt).toLocaleString()}
          </span>
          <span className="history-topic">
            {log.topic}
            <span className="history-count">{log.resultCount} results</span>
          </span>
        </div>
      ))}
    </div>
  );
}
import "./HistoryList.css";

export function HistoryList({ history }) {
  return (
    <div className="history-list">
      {history.map((log) => (
        <div key={log._id} className="history-row">
          <span className="history-tool">{log.tool}</span>
          <span className="history-topic">{log.topic}</span>
          <span className="history-count">{log.resultCount} results</span>
          <span className="history-time">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
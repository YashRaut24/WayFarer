import "./HeadlineCard.css";

export function HeadlineCard({ headline }) {
  return (
    <a
      href={headline.url}
      target="_blank"
      rel="noreferrer"
      className="headline-card"
    >
      <div className="headline-source">{headline.source}</div>
      <div className="headline-title">{headline.title}</div>
    </a>
  );
}
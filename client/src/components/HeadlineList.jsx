import "./HeadlineList.css";
import { HeadlineCard } from "./HeadlineCard";

export function HeadlineList({ headlines }) {
  if (headlines.length === 0) return null;

  return (
    <div className="headline-grid">
      {headlines.map((h, i) => (
        <HeadlineCard key={i} headline={h} />
      ))}
    </div>
  );
}
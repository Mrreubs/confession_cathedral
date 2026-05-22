import type { Confession } from '../types';
import ConfessionCard from './ConfessionCard';
import './ConfessionFeed.css';

interface ConfessionFeedProps {
  confessions: Confession[];
}

export default function ConfessionFeed({ confessions }: ConfessionFeedProps) {
  if (confessions.length === 0) {
    return (
      <div className="feed-empty">
        <p>No confessions yet. Be the first.</p>
      </div>
    );
  }

  return (
    <section className="confession-feed">
      {confessions.map((c) => (
        <ConfessionCard key={c.id} confession={c} />
      ))}
    </section>
  );
}

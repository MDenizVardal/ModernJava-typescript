import MultiplierBadge from "./MultiplierBadge";

export default function ProgressBar({ current, total, points, streak }) {
  const pct = Math.round((current / total) * 100);

  return (
    <>
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="quiz-meta">
        <span className="progress-label">
          Question {current + 1} of {total}
        </span>
        <MultiplierBadge key={streak} streak={streak} />
        <span className="score-display">{points} pts</span>
      </div>
    </>
  );
}

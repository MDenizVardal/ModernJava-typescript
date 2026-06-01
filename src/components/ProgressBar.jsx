// ProgressBar.jsx – shows how far through the quiz the user is,
// the live point total, and the active combo multiplier badge.
import MultiplierBadge from "./MultiplierBadge";

export default function ProgressBar({ current, total, points, streak }) {
  // Convert the current question index to a 0–100 percentage for the CSS width.
  const pct = Math.round((current / total) * 100);

  return (
    <>
      {/* The coloured fill bar – width is driven by inline style */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>

      {/* Three items spaced between: position label, combo badge, score */}
      <div className="quiz-meta">
        <span className="progress-label">Question {current + 1} of {total}</span>

        {/* key={streak} forces React to remount the badge whenever the streak
            changes, which restarts the CSS pop animation on each level-up. */}
        <MultiplierBadge key={streak} streak={streak} />

        <span className="score-display">{points} pts</span>
      </div>
    </>
  );
}

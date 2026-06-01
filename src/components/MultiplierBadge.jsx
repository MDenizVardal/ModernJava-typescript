// MultiplierBadge.jsx – displays the current combo multiplier in the quiz header.
// The badge colour changes with each tier and pulses at maximum (3×).
import { getMultiplier, getMultiplierLevel } from "../utils/scoring";

export default function MultiplierBadge({ streak }) {
  // Derive display value and CSS level from the streak count.
  const mult  = getMultiplier(streak);
  const level = getMultiplierLevel(streak); // "base" | "low" | "mid" | "high" | "max"

  return (
    <div
      className={`multiplier-badge mult-${level}`}
      // Tooltip gives quick guidance on hover.
      title={
        streak > 0
          ? `${mult}× combo — ${streak} correct in a row!`
          : "Answer correctly to build a combo multiplier"
      }
    >
      {/* Show ⚡ when a combo is active, × when at base level */}
      <span className="mult-icon">{streak > 0 ? "⚡" : "×"}</span>
      <span className="mult-value">{mult}×</span>
    </div>
  );
}

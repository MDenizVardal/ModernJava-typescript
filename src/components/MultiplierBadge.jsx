import { getMultiplier, getMultiplierLevel } from "../utils/scoring";

export default function MultiplierBadge({ streak }) {
  const mult  = getMultiplier(streak);
  const level = getMultiplierLevel(streak);

  return (
    <div
      className={`multiplier-badge mult-${level}`}
      title={
        streak > 0
          ? `${mult}× combo — ${streak} correct in a row!`
          : "Answer correctly to build a combo multiplier"
      }
    >
      <span className="mult-icon">{streak > 0 ? "⚡" : "×"}</span>
      <span className="mult-value">{mult}×</span>
    </div>
  );
}

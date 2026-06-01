export default function FeedbackBanner({ visible, isCorrect, earned, multiplier, streak }) {
  if (!visible) return null;

  const comboActive = multiplier > 1;

  return (
    <div className={`feedback-banner ${isCorrect ? "correct" : "wrong"}`}>
      <span className="feedback-icon">{isCorrect ? "✓" : "✗"}</span>
      <div className="feedback-content">
        <span className="feedback-verdict">{isCorrect ? "Correct!" : "Wrong!"}</span>
        <span className="feedback-points">
          {isCorrect
            ? `+${earned} pts${comboActive ? ` · ${multiplier}× combo` : ""}`
            : comboActive ? "Combo reset! · No points" : "No points"}
        </span>
      </div>
      {streak >= 2 && (
        <span className="streak-badge">🔥 {streak}× streak</span>
      )}
    </div>
  );
}

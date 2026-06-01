// FeedbackBanner.jsx – slides in after the user answers a question.
// Shows whether the answer was correct, how many points were earned,
// whether a combo multiplier was applied, and the current streak.
export default function FeedbackBanner({ visible, isCorrect, earned, multiplier, streak }) {
  // Return nothing while the question is unanswered – the banner doesn't exist in the DOM.
  if (!visible) return null;

  // True when the user had a streak before this answer (multiplier was above 1×).
  const comboActive = multiplier > 1;

  return (
    <div className={`feedback-banner ${isCorrect ? "correct" : "wrong"}`}>
      <span className="feedback-icon">{isCorrect ? "✓" : "✗"}</span>

      <div className="feedback-content">
        <span className="feedback-verdict">{isCorrect ? "Correct!" : "Wrong!"}</span>
        <span className="feedback-points">
          {isCorrect
            // Show earned points and the combo multiplier that was applied.
            ? `+${earned} pts${comboActive ? ` · ${multiplier}× combo` : ""}`
            // If the user had a combo, tell them it was just broken.
            : comboActive ? "Combo reset! · No points" : "No points"}
        </span>
      </div>

      {/* Streak badge only appears after 2 or more consecutive correct answers */}
      {streak >= 2 && (
        <span className="streak-badge">🔥 {streak}× streak</span>
      )}
    </div>
  );
}

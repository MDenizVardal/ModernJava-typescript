// ResultsScreen.jsx – shown when the user finishes all questions.
// Displays score, points, peak combo, category breakdown, and a full question review.
import CategoryBreakdown from "./CategoryBreakdown";
import QuestionReview    from "./QuestionReview";

// Maps score percentages to an icon and message shown at the top.
const THRESHOLDS = [
  { min: 100, icon: "🏆", message: "Perfect score! Outstanding!" },
  { min: 80,  icon: "🎉", message: "Excellent work!" },
  { min: 60,  icon: "👍", message: "Good job! Keep it up." },
  { min: 40,  icon: "📚", message: "Not bad — keep studying!" },
  { min: 0,   icon: "💪", message: "Better luck next time!" },
];

export default function ResultsScreen({ state, questions, onRestart }) {
  const { score, points, results } = state;

  // Calculate percentage correct for selecting the right feedback threshold.
  const pct      = Math.round((score / questions.length) * 100);
  const feedback = THRESHOLDS.find((t) => pct >= t.min); // first threshold the score meets

  // Find the highest multiplier achieved on any correct answer during this run.
  const peakMultiplier = results.reduce(
    (max, r) => (r.correct && (r.multiplier ?? 1) > max ? (r.multiplier ?? 1) : max),
    1 // starting value – 1× means no combo was ever active
  );

  return (
    <div className="results-screen">
      <div className="results-card">
        <div className="results-icon">{feedback.icon}</div>
        <h2 className="results-title">Quiz Complete!</h2>
        <p className="results-points">{points} pts</p>
        <p className="results-score">
          {score} / {questions.length} correct ({pct}%)
        </p>

        {/* Only show the peak combo line if the user actually earned a multiplier */}
        {peakMultiplier > 1 && (
          <p className="results-peak-combo">
            ⚡ Peak combo: <strong>{peakMultiplier}×</strong>
          </p>
        )}

        <p className="results-message">{feedback.message}</p>

        {/* Per-category score summary */}
        <CategoryBreakdown questions={questions} results={results} />

        {/* Scrollable list of every question with correct/wrong verdict */}
        <QuestionReview results={results} questions={questions} />

        <button className="btn-restart" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}

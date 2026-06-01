// QuestionReview.jsx – scrollable list shown at the bottom of the results screen.
// Each row shows whether the answer was correct, the question text, and points
// earned. Wrong answers also show what the user picked vs. the correct answer.
export default function QuestionReview({ results, questions }) {
  return (
    <div className="question-review">
      {results.map((result) => {
        // Re-join the result entry back to its full question object by id.
        const q        = questions.find((q) => q.id === result.questionId);
        const selected = q.answers.find((a) => a.id === result.selectedId);
        const correct  = q.answers.find((a) => a.id === q.correctId);

        // The multiplier that was active when this question was answered.
        const mult = result.multiplier ?? 1; // default to 1 for backwards compatibility

        return (
          <div key={result.questionId} className={`review-item ${result.correct ? "correct" : "wrong"}`}>
            <span className="review-icon">{result.correct ? "✓" : "✗"}</span>

            <div className="review-body">
              <p className="review-question">{q.text}</p>
              {/* Only show the answer comparison row for wrong answers */}
              {!result.correct && (
                <p className="review-answer">
                  Your answer: <strong>{selected.text}</strong> · Correct:{" "}
                  <strong>{correct.text}</strong>
                </p>
              )}
            </div>

            {/* Show the combo multiplier next to points if one was active */}
            <span className="review-pts">
              {result.correct
                ? `+${result.earned}${mult > 1 ? ` (${mult}×)` : ""}`
                : "0"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

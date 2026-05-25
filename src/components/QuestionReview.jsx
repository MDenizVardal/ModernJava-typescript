export default function QuestionReview({ results, questions }) {
  return (
    <div className="question-review">
      {results.map((result) => {
        const q          = questions.find((q) => q.id === result.questionId);
        const selected   = q.answers.find((a) => a.id === result.selectedId);
        const correct    = q.answers.find((a) => a.id === q.correctId);
        return (
          <div key={result.questionId} className={`review-item ${result.correct ? "correct" : "wrong"}`}>
            <span className="review-icon">{result.correct ? "✓" : "✗"}</span>
            <div className="review-body">
              <p className="review-question">{q.text}</p>
              {!result.correct && (
                <p className="review-answer">
                  Your answer: <strong>{selected.text}</strong> · Correct:{" "}
                  <strong>{correct.text}</strong>
                </p>
              )}
            </div>
            <span className="review-pts">
              {result.correct ? `+${result.earned}` : "0"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

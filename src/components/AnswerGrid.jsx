export default function AnswerGrid({ answers, correctId, selectedId, answered, onSelect }) {
  function getClass(answerId) {
    if (!answered) return "answer-btn";
    if (answerId === correctId) return "answer-btn correct";
    if (answerId === selectedId) return "answer-btn wrong";
    return "answer-btn";
  }

  return (
    <div className="answers-grid">
      {answers.map((answer) => (
        <button
          key={answer.id}
          className={getClass(answer.id)}
          disabled={answered}
          onClick={() => onSelect(answer.id)}
        >
          {answer.text}
        </button>
      ))}
    </div>
  );
}

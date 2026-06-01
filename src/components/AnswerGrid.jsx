// AnswerGrid.jsx – renders the four answer buttons.
// Before answering all buttons are interactive; after answering they are
// disabled and colour-coded: green for correct, red for the wrong choice.
export default function AnswerGrid({ answers, correctId, selectedId, answered, onSelect }) {

  // Returns the CSS class for a single button based on quiz state.
  function getClass(answerId) {
    if (!answered) return "answer-btn"; // quiz still live – no highlights
    if (answerId === correctId) return "answer-btn correct";  // always highlight the right answer
    if (answerId === selectedId) return "answer-btn wrong";   // highlight the user's wrong pick
    return "answer-btn"; // unchosen wrong answers stay neutral
  }

  return (
    <div className="answers-grid">
      {answers.map((answer) => (
        <button
          key={answer.id}
          className={getClass(answer.id)}
          disabled={answered} // lock all buttons once an answer is chosen
          onClick={() => onSelect(answer.id)}
        >
          {answer.text}
        </button>
      ))}
    </div>
  );
}

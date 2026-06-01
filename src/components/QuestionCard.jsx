// QuestionCard.jsx – displays the question text, its category, and difficulty badge.
// Purely presentational: it receives a question object and renders it.
export default function QuestionCard({ question }) {
  return (
    <section className="question-card">
      <div className="question-meta">
        <p className="question-category">{question.category}</p>
        {/* The difficulty class ("easy" | "medium" | "hard") drives the badge colour via CSS */}
        <span className={`difficulty-badge ${question.difficulty}`}>
          {question.difficulty}
        </span>
      </div>
      <h2 className="question-text">{question.text}</h2>
    </section>
  );
}

export default function QuestionCard({ question }) {
  return (
    <section className="question-card">
      <div className="question-meta">
        <p className="question-category">{question.category}</p>
        <span className={`difficulty-badge ${question.difficulty}`}>
          {question.difficulty}
        </span>
      </div>
      <h2 className="question-text">{question.text}</h2>
    </section>
  );
}

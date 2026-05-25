export default function CategoryBreakdown({ questions, results }) {
  const categories = [...new Set(questions.map((q) => q.category))];

  return (
    <div className="category-breakdown">
      {categories.map((cat) => {
        const catQs      = questions.filter((q) => q.category === cat);
        const catResults = results.filter((r) => catQs.find((q) => q.id === r.questionId));
        const correct    = catResults.filter((r) => r.correct).length;
        const pts        = catResults.reduce((sum, r) => sum + r.earned, 0);
        return (
          <div key={cat} className="category-row">
            <span>{cat}</span>
            <span>{correct}/{catQs.length} · {pts} pts</span>
          </div>
        );
      })}
    </div>
  );
}

// CategoryBreakdown.jsx – shows a per-category score summary on the results screen.
// For each category it shows how many questions were answered correctly and the
// total points earned (already including any combo multipliers).
export default function CategoryBreakdown({ questions, results }) {
  // Deduplicate category names while preserving their first-seen order.
  const categories = [...new Set(questions.map((q) => q.category))];

  return (
    <div className="category-breakdown">
      {categories.map((cat) => {
        // All questions that belong to this category.
        const catQs = questions.filter((q) => q.category === cat);

        // The result entries that correspond to those questions.
        const catResults = results.filter((r) => catQs.find((q) => q.id === r.questionId));

        // Count correct answers and sum points for this category.
        const correct = catResults.filter((r) => r.correct).length;
        const pts     = catResults.reduce((sum, r) => sum + r.earned, 0);

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

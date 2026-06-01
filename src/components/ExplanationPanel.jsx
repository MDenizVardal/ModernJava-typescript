// ExplanationPanel.jsx – shows the explanation for the current question
// after the user has answered. Returns null while the question is unanswered
// so it takes up no space in the layout.
export default function ExplanationPanel({ visible, text }) {
  if (!visible) return null;

  return (
    <div className="explanation-panel">
      <span className="explanation-label">💡 Explanation</span>
      <p>{text}</p>
    </div>
  );
}

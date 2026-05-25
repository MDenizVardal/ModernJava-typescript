export default function ExplanationPanel({ visible, text }) {
  if (!visible) return null;

  return (
    <div className="explanation-panel">
      <span className="explanation-label">💡 Explanation</span>
      <p>{text}</p>
    </div>
  );
}

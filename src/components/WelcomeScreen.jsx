import { useMemo } from "react";

export default function WelcomeScreen({ questions, POINTS, onStart }) {
  const maxPoints = useMemo(
    () => questions.reduce((sum, q) => sum + POINTS[q.difficulty], 0),
    [questions, POINTS]
  );

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">🧠</div>
      <h2 className="welcome-title">Ready to play?</h2>
      <p className="welcome-desc">
        Test yourself across 5 categories with difficulty-based scoring.
      </p>
      <div className="welcome-stats">
        <div className="stat-item">
          <span className="stat-value">{questions.length}</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{maxPoints}</span>
          <span className="stat-label">Max pts</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">3</span>
          <span className="stat-label">Difficulties</span>
        </div>
      </div>
      <button className="btn-start" onClick={onStart}>
        Start Quiz →
      </button>
    </div>
  );
}

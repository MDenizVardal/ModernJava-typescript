import { useMemo } from "react";

export default function WelcomeScreen({ questions, POINTS, onStart }) {
  const maxBase = useMemo(
    () => questions.reduce((sum, q) => sum + POINTS[q.difficulty], 0),
    [questions, POINTS]
  );

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">🧠</div>
      <h2 className="welcome-title">Ready to play?</h2>
      <p className="welcome-desc">
        Test yourself across 5 categories. Build answer streaks to activate
        a <strong>combo multiplier</strong> and earn up to <strong>3×</strong> points!
      </p>
      <div className="welcome-stats">
        <div className="stat-item">
          <span className="stat-value">{questions.length}</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{maxBase}</span>
          <span className="stat-label">Base pts</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">3×</span>
          <span className="stat-label">Max combo</span>
        </div>
      </div>
      <button className="btn-start" onClick={onStart}>
        Start Quiz →
      </button>
    </div>
  );
}

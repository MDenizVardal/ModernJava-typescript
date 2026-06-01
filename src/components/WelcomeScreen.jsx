import { useState, useMemo } from "react";
import QuestionLoader from "./QuestionLoader";

export default function WelcomeScreen({ questions, POINTS, onStart, onQuestionsLoaded, isCustom }) {
  const [showLoader, setShowLoader] = useState(false);

  const maxBase = useMemo(
    () => questions.reduce((sum, q) => sum + POINTS[q.difficulty], 0),
    [questions, POINTS]
  );

  function handleLoaded(qs) {
    onQuestionsLoaded(qs);
    setShowLoader(false);
  }

  function resetToDefaults() {
    onQuestionsLoaded(null);
    setShowLoader(false);
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">🧠</div>
      <h2 className="welcome-title">Ready to play?</h2>
      <p className="welcome-desc">
        Test yourself across categories. Build answer streaks to activate
        a <strong>combo multiplier</strong> and earn up to <strong>3×</strong> points!
      </p>

      {isCustom && (
        <div className="custom-badge">
          ✓ Custom questions active
          <button className="btn-reset-defaults" onClick={resetToDefaults}>
            Reset to defaults
          </button>
        </div>
      )}

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

      <div className="loader-divider"><span>or</span></div>

      <button
        className={`btn-load-toggle ${showLoader ? "active" : ""}`}
        onClick={() => setShowLoader(v => !v)}
      >
        {showLoader ? "✕ Cancel" : "📥 Load custom questions"}
      </button>

      {showLoader && <QuestionLoader onLoad={handleLoaded} />}
    </div>
  );
}

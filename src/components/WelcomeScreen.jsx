// WelcomeScreen.jsx – the entry screen shown before the quiz starts.
// It also hosts the optional QuestionLoader panel.
import { useState, useMemo } from "react";
import QuestionLoader from "./QuestionLoader";

export default function WelcomeScreen({ questions, POINTS, onStart, onQuestionsLoaded, isCustom }) {
  // Controls whether the QuestionLoader panel is expanded or hidden.
  const [showLoader, setShowLoader] = useState(false);

  // Sum up base points across all questions.
  // useMemo avoids recalculating on every render – only recalculates when
  // questions or POINTS change (e.g. after loading custom questions).
  const maxBase = useMemo(
    () => questions.reduce((sum, q) => sum + POINTS[q.difficulty], 0),
    [questions, POINTS]
  );

  // Called by QuestionLoader once questions have been validated.
  // Passes them up to App and collapses the loader panel.
  function handleLoaded(qs) {
    onQuestionsLoaded(qs);
    setShowLoader(false);
  }

  // Clears custom questions and returns to the built-in set.
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

      {/* Only shown when the user has loaded their own questions */}
      {isCustom && (
        <div className="custom-badge">
          ✓ Custom questions active
          <button className="btn-reset-defaults" onClick={resetToDefaults}>
            Reset to defaults
          </button>
        </div>
      )}

      {/* Stats reflect whichever question set is currently active */}
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

      {/* Visual separator between the primary action and the secondary loader option */}
      <div className="loader-divider"><span>or</span></div>

      {/* Toggle the QuestionLoader panel open/closed */}
      <button
        className={`btn-load-toggle ${showLoader ? "active" : ""}`}
        onClick={() => setShowLoader(v => !v)}
      >
        {showLoader ? "✕ Cancel" : "📥 Load custom questions"}
      </button>

      {/* Conditionally rendered – mounts when opened, unmounts when closed */}
      {showLoader && <QuestionLoader onLoad={handleLoaded} />}
    </div>
  );
}

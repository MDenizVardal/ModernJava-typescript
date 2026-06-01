// QuizScreen.jsx – the main game screen shown while the quiz is in progress.
// It composes all the smaller quiz sub-components and wires up keyboard shortcuts.
import { useEffect } from "react";
import ProgressBar     from "./ProgressBar";
import QuestionCard    from "./QuestionCard";
import AnswerGrid      from "./AnswerGrid";
import FeedbackBanner  from "./FeedbackBanner";
import ExplanationPanel from "./ExplanationPanel";

export default function QuizScreen({ state, question, total, onSelectAnswer, onNext }) {
  const { currentIndex, points, answered, streak, results } = state;

  // The most recent result entry – only exists after the user has answered.
  const lastResult = answered ? results[results.length - 1] : null;

  // Keyboard shortcuts: number keys 1–4 select an answer, Enter/Space advance.
  useEffect(() => {
    function handleKeyDown(e) {
      // Select answer by number key (only before answering)
      if (["1", "2", "3", "4"].includes(e.key) && !answered) {
        const answer = question.answers[Number(e.key) - 1];
        if (answer) onSelectAnswer(answer.id);
      }
      // Advance to the next question (only after answering)
      if ((e.key === "Enter" || e.key === " ") && answered) {
        e.preventDefault(); // prevent spacebar from scrolling the page
        onNext();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    // Cleanup: remove the listener when the question changes or component unmounts
    // to avoid stale closures calling the wrong handler.
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [answered, question, onSelectAnswer, onNext]);

  return (
    <main className="quiz-container">
      {/* Progress bar + combo badge + live score */}
      <ProgressBar current={currentIndex} total={total} points={points} streak={streak} />

      {/* The question text, category label and difficulty badge */}
      <QuestionCard question={question} />

      {/* Four answer buttons; highlights correct/wrong after answering */}
      <AnswerGrid
        answers={question.answers}
        correctId={question.correctId}
        selectedId={lastResult?.selectedId ?? null}  // null before answering
        answered={answered}
        onSelect={onSelectAnswer}
      />

      {/* Slides in after answering – shows correct/wrong verdict and combo info */}
      <FeedbackBanner
        visible={answered}
        isCorrect={lastResult?.correct ?? false}
        earned={lastResult?.earned ?? 0}
        multiplier={lastResult?.multiplier ?? 1}
        streak={streak}
      />

      {/* Shows the explanation text after the user has answered */}
      <ExplanationPanel visible={answered} text={question.explanation} />

      <div className="quiz-footer">
        <p className="keyboard-hint">Press 1–4 to select · Enter to continue</p>
        <button className="btn-next" disabled={!answered} onClick={onNext}>
          Next →
        </button>
      </div>
    </main>
  );
}

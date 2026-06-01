import { useEffect } from "react";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import AnswerGrid from "./AnswerGrid";
import FeedbackBanner from "./FeedbackBanner";
import ExplanationPanel from "./ExplanationPanel";

export default function QuizScreen({ state, question, total, onSelectAnswer, onNext }) {
  const { currentIndex, points, answered, streak, results } = state;
  const lastResult = answered ? results[results.length - 1] : null;

  // Keyboard shortcut: 1-4 picks an answer, Enter/Space advances
  useEffect(() => {
    function handleKeyDown(e) {
      if (["1", "2", "3", "4"].includes(e.key) && !answered) {
        const answer = question.answers[Number(e.key) - 1];
        if (answer) onSelectAnswer(answer.id);
      }
      if ((e.key === "Enter" || e.key === " ") && answered) {
        e.preventDefault();
        onNext();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [answered, question, onSelectAnswer, onNext]);

  return (
    <main className="quiz-container">
      <ProgressBar current={currentIndex} total={total} points={points} streak={streak} />

      <QuestionCard question={question} />

      <AnswerGrid
        answers={question.answers}
        correctId={question.correctId}
        selectedId={lastResult?.selectedId ?? null}
        answered={answered}
        onSelect={onSelectAnswer}
      />

      <FeedbackBanner
        visible={answered}
        isCorrect={lastResult?.correct ?? false}
        earned={lastResult?.earned ?? 0}
        multiplier={lastResult?.multiplier ?? 1}
        streak={streak}
      />

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

import { useState } from "react";
import { questions as defaultQuestions, POINTS } from "./data/questions";
import { getMultiplier } from "./utils/scoring";
import WelcomeScreen from "./components/WelcomeScreen";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";

const INITIAL_STATE = {
  phase: "welcome",   // "welcome" | "playing" | "results"
  currentIndex: 0,
  score: 0,
  points: 0,
  streak: 0,
  answered: false,
  results: [],
};

export default function App() {
  const [state, setState]               = useState(INITIAL_STATE);
  // Kept outside INITIAL_STATE so custom questions survive "Play Again" restarts.
  const [customQuestions, setCustomQuestions] = useState(null);

  const activeQuestions = customQuestions ?? defaultQuestions;

  function startQuiz() {
    setState({ ...INITIAL_STATE, phase: "playing" });
  }

  function selectAnswer(selectedId) {
    if (state.answered) return;
    const question   = activeQuestions[state.currentIndex];
    const isCorrect  = selectedId === question.correctId;
    const multiplier = getMultiplier(state.streak);
    const earned     = isCorrect ? Math.round(POINTS[question.difficulty] * multiplier) : 0;
    setState((prev) => ({
      ...prev,
      answered: true,
      score:  isCorrect ? prev.score + 1 : prev.score,
      points: prev.points + earned,
      streak: isCorrect ? prev.streak + 1 : 0,
      results: [...prev.results, { questionId: question.id, selectedId, correct: isCorrect, earned, multiplier }],
    }));
  }

  function nextQuestion() {
    const next = state.currentIndex + 1;
    if (next < activeQuestions.length) {
      setState((prev) => ({ ...prev, currentIndex: next, answered: false }));
    } else {
      setState((prev) => ({ ...prev, phase: "results" }));
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">JavaScript Quiz App</h1>
        <p className="app-subtitle">Test your knowledge</p>
      </header>

      {state.phase === "welcome" && (
        <WelcomeScreen
          questions={activeQuestions}
          POINTS={POINTS}
          onStart={startQuiz}
          onQuestionsLoaded={setCustomQuestions}
          isCustom={customQuestions !== null}
        />
      )}
      {state.phase === "playing" && (
        <QuizScreen
          state={state}
          question={activeQuestions[state.currentIndex]}
          total={activeQuestions.length}
          onSelectAnswer={selectAnswer}
          onNext={nextQuestion}
        />
      )}
      {state.phase === "results" && (
        <ResultsScreen
          state={state}
          questions={activeQuestions}
          onRestart={() => setState({ ...INITIAL_STATE, phase: "welcome" })}
        />
      )}
    </div>
  );
}

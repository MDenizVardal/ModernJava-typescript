// App.jsx – root component that owns all quiz state and drives screen transitions.
import { useState } from "react";
import { questions as defaultQuestions, POINTS } from "./data/questions";
import { getMultiplier } from "./utils/scoring";
import WelcomeScreen  from "./components/WelcomeScreen";
import QuizScreen     from "./components/QuizScreen";
import ResultsScreen  from "./components/ResultsScreen";

// INITIAL_STATE is defined outside the component so the same object
// can be spread whenever the quiz needs a full reset (e.g. Play Again).
const INITIAL_STATE = {
  phase:        "welcome", // controls which screen is rendered: "welcome" | "playing" | "results"
  currentIndex: 0,         // index into activeQuestions array
  score:        0,         // number of correct answers
  points:       0,         // total points earned (includes combo multiplier)
  streak:       0,         // consecutive correct answers – feeds getMultiplier()
  answered:     false,     // true once the user picks an answer for the current question
  results:      [],        // one entry per answered question, used by the results screen
};

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);

  // customQuestions lives OUTSIDE INITIAL_STATE on purpose:
  // spreading INITIAL_STATE on restart resets the quiz progress but keeps
  // the user's loaded questions so they don't have to re-paste them.
  const [customQuestions, setCustomQuestions] = useState(null);

  // Prefer custom questions if loaded; otherwise fall back to the built-in set.
  const activeQuestions = customQuestions ?? defaultQuestions;

  // Transition from welcome screen to the first question.
  function startQuiz() {
    setState({ ...INITIAL_STATE, phase: "playing" });
  }

  // Called when the user clicks an answer button.
  function selectAnswer(selectedId) {
    if (state.answered) return; // guard against double-clicks

    const question   = activeQuestions[state.currentIndex];
    const isCorrect  = selectedId === question.correctId;

    // Read the multiplier from the streak BEFORE updating it,
    // so this question's points reflect the streak built up beforehand.
    const multiplier = getMultiplier(state.streak);
    const earned     = isCorrect ? Math.round(POINTS[question.difficulty] * multiplier) : 0;

    setState((prev) => ({
      ...prev,
      answered: true,
      score:    isCorrect ? prev.score + 1 : prev.score,
      points:   prev.points + earned,
      streak:   isCorrect ? prev.streak + 1 : 0, // reset to 0 on wrong answer
      results:  [...prev.results, { questionId: question.id, selectedId, correct: isCorrect, earned, multiplier }],
    }));
  }

  // Advance to the next question, or end the quiz when all questions are done.
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

      {/* Render only the screen that matches the current phase */}
      {state.phase === "welcome" && (
        <WelcomeScreen
          questions={activeQuestions}
          POINTS={POINTS}
          onStart={startQuiz}
          onQuestionsLoaded={setCustomQuestions} // called by QuestionLoader when questions are ready
          isCustom={customQuestions !== null}    // shows the "custom active" badge
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

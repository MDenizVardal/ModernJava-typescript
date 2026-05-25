const questions = [
  {
    id: 1,
    category: "Science",
    difficulty: "easy",
    text: "What is the chemical symbol for water?",
    answers: [
      { id: "a", text: "H₂O" },
      { id: "b", text: "CO₂" },
      { id: "c", text: "NaCl" },
      { id: "d", text: "O₂" },
    ],
    correctId: "a",
    explanation: "Water consists of two hydrogen atoms bonded to one oxygen atom — hence H₂O.",
  },
  {
    id: 2,
    category: "Geography",
    difficulty: "easy",
    text: "Which is the largest ocean on Earth?",
    answers: [
      { id: "a", text: "Atlantic" },
      { id: "b", text: "Indian" },
      { id: "c", text: "Arctic" },
      { id: "d", text: "Pacific" },
    ],
    correctId: "d",
    explanation: "The Pacific Ocean covers over 165 million km² — larger than all land masses combined.",
  },
  {
    id: 3,
    category: "History",
    difficulty: "medium",
    text: "In which year did World War II end?",
    answers: [
      { id: "a", text: "1943" },
      { id: "b", text: "1945" },
      { id: "c", text: "1947" },
      { id: "d", text: "1939" },
    ],
    correctId: "b",
    explanation: "WWII ended in 1945: Germany surrendered in May, Japan in September after the atomic bombings.",
  },
  {
    id: 4,
    category: "Mathematics",
    difficulty: "easy",
    text: "What is the value of π (pi) to two decimal places?",
    answers: [
      { id: "a", text: "3.14" },
      { id: "b", text: "3.16" },
      { id: "c", text: "3.12" },
      { id: "d", text: "3.18" },
    ],
    correctId: "a",
    explanation: "Pi (π) is approximately 3.14159…, commonly rounded to 3.14 for general use.",
  },
  {
    id: 5,
    category: "Technology",
    difficulty: "easy",
    text: "What does 'HTML' stand for?",
    answers: [
      { id: "a", text: "Hyper Text Markup Language" },
      { id: "b", text: "High Tech Modern Language" },
      { id: "c", text: "Hyper Transfer Markup Logic" },
      { id: "d", text: "Home Tool Markup Language" },
    ],
    correctId: "a",
    explanation: "HTML (HyperText Markup Language) is the standard language for structuring web pages.",
  },
  {
    id: 6,
    category: "Science",
    difficulty: "medium",
    text: "How many bones are in the adult human body?",
    answers: [
      { id: "a", text: "186" },
      { id: "b", text: "206" },
      { id: "c", text: "216" },
      { id: "d", text: "196" },
    ],
    correctId: "b",
    explanation: "Adults have 206 bones. Babies are born with ~270, which gradually fuse as they grow.",
  },
  {
    id: 7,
    category: "Geography",
    difficulty: "medium",
    text: "What is the capital city of Australia?",
    answers: [
      { id: "a", text: "Sydney" },
      { id: "b", text: "Melbourne" },
      { id: "c", text: "Canberra" },
      { id: "d", text: "Brisbane" },
    ],
    correctId: "c",
    explanation: "Canberra is Australia's capital — chosen as a compromise between rivals Sydney and Melbourne.",
  },
  {
    id: 8,
    category: "Technology",
    difficulty: "hard",
    text: "Which data structure uses LIFO (Last In, First Out) order?",
    answers: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Linked List" },
      { id: "c", text: "Stack" },
      { id: "d", text: "Tree" },
    ],
    correctId: "c",
    explanation: "A Stack follows LIFO — the last element pushed is the first to be popped, like a stack of plates.",
  },
];

const POINTS = { easy: 10, medium: 20, hard: 30 };

// Single source of truth — all mutable quiz data lives here
const state = {
  phase: "welcome",   // "welcome" | "playing" | "results"
  currentIndex: 0,
  score: 0,
  points: 0,
  streak: 0,
  answered: false,
  results: [],        // { questionId, selectedId, correct, earned }
};

const welcomeScreen    = document.getElementById("welcome-screen");
const welcomeMaxPts    = document.getElementById("welcome-max-pts");
const btnStart         = document.getElementById("btn-start");
const progressBar      = document.getElementById("progress-bar");
const progressLabel    = document.getElementById("progress-label");
const scoreDisplay     = document.getElementById("score-display");
const questionCategory = document.getElementById("question-category");
const difficultyBadge  = document.getElementById("difficulty-badge");
const questionText     = document.getElementById("question-text");
const answersGrid      = document.getElementById("answers-grid");
const feedbackBanner   = document.getElementById("feedback-banner");
const feedbackIcon     = document.getElementById("feedback-icon");
const feedbackVerdict  = document.getElementById("feedback-verdict");
const feedbackPoints   = document.getElementById("feedback-points");
const streakBadge      = document.getElementById("streak-badge");
const explanationPanel = document.getElementById("explanation-panel");
const explanationText  = document.getElementById("explanation-text");
const btnNext          = document.getElementById("btn-next");
const quizContainer    = document.getElementById("quiz-container");
const resultsScreen    = document.getElementById("results-screen");
const resultsPts       = document.getElementById("results-points");
const resultsScore     = document.getElementById("results-score");
const resultsMessage   = document.getElementById("results-message");
const resultsIcon      = document.getElementById("results-icon");
const categoryBreakdown = document.getElementById("category-breakdown");
const questionReview   = document.getElementById("question-review");
const btnRestart       = document.getElementById("btn-restart");

// Controls which screen is visible — the only place screen visibility changes
function transitionTo(phase) {
  state.phase = phase;
  welcomeScreen.classList.toggle("hidden", phase !== "welcome");
  quizContainer.classList.toggle("hidden", phase !== "playing");
  resultsScreen.classList.toggle("hidden", phase !== "results");
}

function startQuiz() {
  state.currentIndex = 0;
  state.score    = 0;
  state.points   = 0;
  state.streak   = 0;
  state.answered = false;
  state.results.length = 0;
  scoreDisplay.textContent = "0 pts";
  progressBar.style.width  = "0%";
  transitionTo("playing");
  loadQuestion(0);
}

function loadQuestion(index) {
  state.answered = false;
  btnNext.disabled = true;
  feedbackBanner.className = "feedback-banner hidden";
  explanationPanel.classList.add("hidden");

  const q = questions[index];
  progressBar.style.width  = `${(index / questions.length) * 100}%`;
  progressLabel.textContent = `Question ${index + 1} of ${questions.length}`;
  questionCategory.textContent = q.category;
  questionText.textContent     = q.text;
  difficultyBadge.textContent  = q.difficulty;
  difficultyBadge.className    = `difficulty-badge ${q.difficulty}`;

  renderAnswers(q);
}

// Builds one button per answer object and wires its click event
function renderAnswers(question) {
  answersGrid.innerHTML = "";
  question.answers.forEach((answer) => {
    const btn = document.createElement("button");
    btn.className   = "answer-btn";
    btn.dataset.id  = answer.id;
    btn.textContent = answer.text;
    btn.addEventListener("click", () => selectAnswer(btn, answer.id, question));
    answersGrid.appendChild(btn);
  });
}

function selectAnswer(selectedBtn, selectedId, question) {
  if (state.answered) return;
  state.answered = true;

  const isCorrect = selectedId === question.correctId;
  const earned    = isCorrect ? POINTS[question.difficulty] : 0;

  if (isCorrect) { state.score++; state.points += earned; state.streak++; }
  else           { state.streak = 0; }

  state.results.push({ questionId: question.id, selectedId, correct: isCorrect, earned });

  const allBtns = answersGrid.querySelectorAll(".answer-btn");
  allBtns.forEach((btn) => (btn.disabled = true));
  selectedBtn.classList.add(isCorrect ? "correct" : "wrong");

  if (!isCorrect) {
    const correctBtn = [...allBtns].find((btn) => btn.dataset.id === question.correctId);
    correctBtn.classList.add("correct");
  }

  showFeedback(isCorrect, earned);
  scoreDisplay.textContent = `${state.points} pts`;

  explanationText.textContent = question.explanation;
  explanationPanel.classList.remove("hidden");
  btnNext.disabled = false;
}

// Animates the feedback banner with verdict, points gained, and streak if active
function showFeedback(isCorrect, earned) {
  feedbackIcon.textContent    = isCorrect ? "✓" : "✗";
  feedbackVerdict.textContent = isCorrect ? "Correct!" : "Wrong!";
  feedbackPoints.textContent  = isCorrect ? `+${earned} pts` : "No points";
  feedbackBanner.className    = `feedback-banner ${isCorrect ? "correct" : "wrong"}`;

  if (state.streak >= 2) {
    streakBadge.textContent = `🔥 ${state.streak}× streak`;
    streakBadge.classList.remove("hidden");
  } else {
    streakBadge.classList.add("hidden");
  }
}

function showResults() {
  transitionTo("results");
  progressBar.style.width = "100%";

  const total = questions.length;
  const pct   = Math.round((state.score / total) * 100);
  resultsPts.textContent   = `${state.points} pts`;
  resultsScore.textContent = `${state.score} / ${total} correct (${pct}%)`;

  const thresholds = [
    { min: 100, icon: "🏆", message: "Perfect score! Outstanding!" },
    { min: 80,  icon: "🎉", message: "Excellent work!" },
    { min: 60,  icon: "👍", message: "Good job! Keep it up." },
    { min: 40,  icon: "📚", message: "Not bad — keep studying!" },
    { min: 0,   icon: "💪", message: "Better luck next time!" },
  ];
  const feedback = thresholds.find((t) => pct >= t.min);
  resultsIcon.textContent    = feedback.icon;
  resultsMessage.textContent = feedback.message;

  const categories = [...new Set(questions.map((q) => q.category))];
  categoryBreakdown.innerHTML = "";
  categories.forEach((cat) => {
    const catQs      = questions.filter((q) => q.category === cat);
    const catResults = state.results.filter((r) => catQs.find((q) => q.id === r.questionId));
    const catCorrect = catResults.filter((r) => r.correct).length;
    const catPoints  = catResults.reduce((sum, r) => sum + r.earned, 0);
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `<span>${cat}</span><span>${catCorrect}/${catQs.length} · ${catPoints} pts</span>`;
    categoryBreakdown.appendChild(row);
  });

  // Build per-question review so the player can see exactly where they went wrong
  questionReview.innerHTML = "";
  state.results.forEach((result) => {
    const q             = questions.find((q) => q.id === result.questionId);
    const selectedAns   = q.answers.find((a) => a.id === result.selectedId);
    const correctAns    = q.answers.find((a) => a.id === q.correctId);
    const item          = document.createElement("div");
    item.className      = `review-item ${result.correct ? "correct" : "wrong"}`;
    item.innerHTML = `
      <span class="review-icon">${result.correct ? "✓" : "✗"}</span>
      <div class="review-body">
        <p class="review-question">${q.text}</p>
        ${!result.correct
          ? `<p class="review-answer">Your answer: <strong>${selectedAns.text}</strong> · Correct: <strong>${correctAns.text}</strong></p>`
          : ""}
      </div>
      <span class="review-pts">${result.correct ? `+${result.earned}` : "0"}</span>
    `;
    questionReview.appendChild(item);
  });
}

// Keyboard: 1-4 select an answer, Enter/Space advances to next question
document.addEventListener("keydown", (e) => {
  if (["1", "2", "3", "4"].includes(e.key)) {
    const btn = answersGrid.querySelectorAll(".answer-btn")[Number(e.key) - 1];
    if (btn && !btn.disabled) btn.click();
  }
  if ((e.key === "Enter" || e.key === " ") && !btnNext.disabled) {
    e.preventDefault();
    btnNext.click();
  }
});

btnStart.addEventListener("click", startQuiz);

btnNext.addEventListener("click", () => {
  state.currentIndex++;
  if (state.currentIndex < questions.length) {
    loadQuestion(state.currentIndex);
  } else {
    showResults();
  }
});

btnRestart.addEventListener("click", () => transitionTo("welcome"));

// Compute and display max achievable points on the welcome screen
const maxPoints = questions.reduce((sum, q) => sum + POINTS[q.difficulty], 0);
welcomeMaxPts.textContent = maxPoints;

transitionTo("welcome");
